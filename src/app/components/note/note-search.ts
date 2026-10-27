interface SearchHighlight {
    add(range: Range): void;
}

interface SearchHighlightWindow {
    Highlight?: new () => SearchHighlight;
    CSS?: {
        highlights?: {
            set(name: string, highlight: SearchHighlight): void;
            delete(name: string): void;
        };
    };
}

export class NoteSearch {
    private readonly highlightName = 'knowte-note-search';

    constructor(private renderer: SearchHighlightWindow = window as SearchHighlightWindow) {}

    public clear(): void {
        this.renderer.CSS?.highlights?.delete(this.highlightName);
    }

    public find(text: string): boolean {
        const renderer = this.renderer;
        if (!renderer.Highlight || !renderer.CSS?.highlights) {
            return false;
        }

        this.clear();
        if (!text) {
            return true;
        }
        const highlight = new renderer.Highlight();
        let firstMatch: { range: Range; root: HTMLElement } | undefined;
        const roots = document.querySelectorAll<HTMLElement>('#editor .ql-editor, #markdown-output');

        for (const root of Array.from(roots)) {
            const nodes: { node: Text; start: number; end: number }[] = [];
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            let content = '';
            let previousBlock: Element | null = null;
            let current: Node | null;
            while ((current = walker.nextNode())) {
                const node = current as Text;
                if (!node.data) {
                    continue;
                }
                const block = node.parentElement?.closest('p,li,pre,blockquote,h1,h2,h3,h4,h5,h6,td,th') || root;
                if (previousBlock && block !== previousBlock) {
                    content += '\n';
                }
                nodes.push({ node, start: content.length, end: content.length + node.data.length });
                content += node.data;
                previousBlock = block;
            }

            const pattern = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            let nodeIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = pattern.exec(content))) {
                while (nodes[nodeIndex].end <= match.index) {
                    nodeIndex++;
                }
                let endNodeIndex = nodeIndex;
                const end = match.index + match[0].length;
                while (nodes[endNodeIndex].end < end) {
                    endNodeIndex++;
                }
                const range = document.createRange();
                range.setStart(nodes[nodeIndex].node, match.index - nodes[nodeIndex].start);
                range.setEnd(nodes[endNodeIndex].node, end - nodes[endNodeIndex].start);
                highlight.add(range);
                firstMatch = firstMatch || { range, root };
            }
        }

        renderer.CSS.highlights.set(this.highlightName, highlight);
        if (firstMatch) {
            const bounds = firstMatch.range.getBoundingClientRect();
            const root = firstMatch.root;
            root.scrollTop = Math.max(0, root.scrollTop + bounds.top - root.getBoundingClientRect().top
                - root.clientHeight / 2 + bounds.height / 2);
        }
        return true;
    }
}