import { marked } from 'marked';

interface SourceBlock {
    startLine: number;
    endLine: number;
    first: Node;
    last: Node;
}

export interface ScrollAnchor {
    editor: number;
    preview: number;
}

export function interpolateScroll(position: number, anchors: ScrollAnchor[], fromEditor: boolean): number {
    const source = fromEditor ? 'editor' : 'preview';
    const target = fromEditor ? 'preview' : 'editor';
    for (let i = 1; i < anchors.length; i++) {
        const left = anchors[i - 1];
        const right = anchors[i];
        if (position <= right[source]) {
            const progress = Math.max(0, (position - left[source]) / (right[source] - left[source]));
            return left[target] + progress * (right[target] - left[target]);
        }
    }
    return anchors[anchors.length - 1][target];
}

function contentNodes(parent: ParentNode): Node[] {
    return Array.from(parent.childNodes).filter((node) => node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim()));
}

// ngx-markdown strips the first nonempty line's indentation, independently on each line.
// Preserve line numbers while lexing exactly the text used by the preview.
function normalizeSource(source: string, pedantic: boolean): string {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const first = lines.find((line) => line.length > 0);
    const indentation = first ? first.search(/\S|$/) : 0;
    const trimmed = lines.map((line) => line.substring(Math.min(indentation, line.search(/\S|$/)))).join('\n');
    // Match Marked's leading-tab preprocessing too; it changes raw tokens, but not line numbers.
    return pedantic
        ? trimmed.replace(/\t/g, '    ').replace(/^ +$/gm, '')
        : trimmed.replace(/^( *)(\t+)/gm, (_, spaces: string, tabs: string) => spaces + '    '.repeat(tabs.length));
}

export function buildSourceBlocks(
    source: string,
    preview: HTMLElement,
    options: marked.MarkedOptions,
    sanitize: (html: string) => string,
): SourceBlock[] {
    // Only DOM structure is compared; generated heading IDs are stripped by preview sanitization.
    const parsingOptions = { ...marked.defaults, ...options, headerIds: false };
    const normalized = normalizeSource(source, !!parsingOptions.pedantic);
    const tokens = marked.lexer(normalized, parsingOptions);
    const nodes = contentNodes(preview);
    const blocks: SourceBlock[] = [];
    let offset = 0;
    let sourceLine = 0;
    let nodeIndex = 0;

    for (const token of tokens) {
        // Marked can append a synthetic newline to a list ending with a single space.
        const raw = token.type === 'list' ? token.raw.trimEnd() : token.raw;
        let start = normalized.indexOf(raw, offset);
        // Reference definitions are omitted by the lexer. Do not match their URL/title text.
        while (start > offset && normalized[start - 1] !== '\n') {
            start = normalized.indexOf(raw, start + 1);
        }
        if (start < 0) {
            throw new Error(`Could not locate Markdown ${token.type} source block.`);
        }
        sourceLine += normalized.substring(offset, start).split('\n').length - 1;
        const startLine = sourceLine;
        sourceLine += raw.split('\n').length - 1;
        offset = start + raw.length;
        const template = document.createElement('template');
        template.innerHTML = sanitize(marked.parser([token], parsingOptions));
        const expected = contentNodes(template.content);
        const actual = nodes.slice(nodeIndex, nodeIndex + expected.length);
        if (expected.length !== actual.length || expected.some((node, index) => node.nodeName !== actual[index].nodeName)) {
            throw new Error(`Markdown ${token.type} block does not match the rendered preview.`);
        }
        nodeIndex += expected.length;
        if (!actual.length) {
            continue;
        }

        const endLine = startLine + token.raw.trimEnd().split('\n').length;
        blocks.push({ startLine, endLine, first: actual[0], last: actual[actual.length - 1] });

        if (token.type === 'list' && 'items' in token && actual[0] instanceof HTMLElement) {
            const items = Array.from(actual[0].children).filter((child) => child.tagName === 'LI');
            let itemOffset = 0;
            token.items.forEach((item: marked.Tokens.ListItem, index: number) => {
                const itemStart = token.raw.indexOf(item.raw, itemOffset);
                if (itemStart >= 0 && items[index]) {
                    const line = startLine + token.raw.substring(0, itemStart).split('\n').length - 1;
                    blocks.push({
                        startLine: line,
                        endLine: line + item.raw.trimEnd().split('\n').length,
                        first: items[index],
                        last: items[index],
                    });
                    itemOffset = itemStart + item.raw.length;
                }
            });
        } else if (token.type === 'table' && actual[0] instanceof HTMLElement) {
            actual[0].querySelectorAll('tr').forEach((row, index) => {
                const line = startLine + (index === 0 ? 0 : index + 1);
                blocks.push({ startLine: line, endLine: line + 1, first: row, last: row });
            });
        }
    }
    if (nodeIndex !== nodes.length) {
        throw new Error('Markdown source map has unmatched preview blocks.');
    }
    return blocks;
}

export class MarkdownScrollMap {
    private mirror: HTMLPreElement;
    private lines: HTMLSpanElement[] = [];
    private blocks: SourceBlock[] = [];
    private anchors: ScrollAnchor[] | undefined;

    public constructor(
        private input: HTMLTextAreaElement,
        private preview: HTMLElement,
        private options: marked.MarkedOptions,
        private sanitize: (html: string) => string,
    ) {
        this.mirror = document.createElement('pre');
        this.mirror.className = 'markdown-input markdown-scroll-measurement';
        this.mirror.setAttribute('aria-hidden', 'true');
        input.parentElement.appendChild(this.mirror);
    }

    public update(source: string): void {
        this.blocks = buildSourceBlocks(source, this.preview, this.options, this.sanitize);
        this.mirror.replaceChildren();
        this.lines = [];
        const lines = source.replace(/\r\n?/g, '\n').split('\n');
        // A final sentinel measures the bottom of the last source line.
        for (const line of [...lines, '']) {
            const span = document.createElement('span');
            span.textContent = line || '\u200b';
            this.mirror.append(span, document.createTextNode('\n'));
            this.lines.push(span);
        }
        this.invalidate();
    }

    public invalidate(): void {
        this.anchors = undefined;
    }

    public position(scrollTop: number, fromEditor: boolean): number {
        if (!this.anchors) {
            this.anchors = this.measure();
        }
        return interpolateScroll(scrollTop, this.anchors, fromEditor);
    }

    public destroy(): void {
        this.mirror.remove();
    }

    private measure(): ScrollAnchor[] {
        const editorRange = Math.max(0, this.input.scrollHeight - this.input.clientHeight);
        const previewRange = Math.max(0, this.preview.scrollHeight - this.preview.clientHeight);
        if (!editorRange || !previewRange) {
            return [{ editor: 0, preview: 0 }];
        }
        this.mirror.style.cssText = this.input.style.cssText;
        this.mirror.style.width = `${this.input.clientWidth}px`;
        const mirrorTop = this.mirror.getBoundingClientRect().top;
        const previewTop = this.preview.getBoundingClientRect().top - this.preview.scrollTop;
        const editorPadding = parseFloat(getComputedStyle(this.input).paddingTop);
        const previewPadding = parseFloat(getComputedStyle(this.preview).paddingTop);
        const lineTop = (line: number) => {
            const rect = this.lines[line]?.getClientRects()[0];
            if (!rect) {
                throw new Error(`Could not measure Markdown source line ${line + 1}.`);
            }
            return rect.top - mirrorTop - editorPadding;
        };
        const nodeRect = (node: Node): DOMRect => {
            if (node instanceof Element) {
                return node.getBoundingClientRect();
            }
            const range = document.createRange();
            range.selectNode(node);
            return range.getBoundingClientRect();
        };
        const candidates: ScrollAnchor[] = [];
        for (const block of this.blocks) {
            candidates.push({
                editor: lineTop(block.startLine),
                preview: nodeRect(block.first).top - previewTop - previewPadding,
            }, {
                editor: lineTop(block.endLine),
                preview: nodeRect(block.last).bottom - previewTop - previewPadding,
            });
        }
        candidates.sort((a, b) => a.editor - b.editor || a.preview - b.preview);
        const anchors: ScrollAnchor[] = [{ editor: 0, preview: 0 }];
        for (const candidate of candidates) {
            const previous = anchors[anchors.length - 1];
            if (candidate.editor > previous.editor && candidate.preview > previous.preview &&
                candidate.editor < editorRange && candidate.preview < previewRange) {
                anchors.push(candidate);
            }
        }
        anchors.push({ editor: editorRange, preview: previewRange });
        return anchors;
    }
}
