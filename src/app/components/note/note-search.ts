interface SearchHighlight {
    priority: number;
    add(range: Range): void;
}

interface SearchHighlightWindow {
    Highlight?: new (...ranges: Range[]) => SearchHighlight;
    CSS?: {
        highlights?: {
            set(name: string, highlight: SearchHighlight): void;
            delete(name: string): void;
        };
    };
}

export class NoteSearch {
    private readonly highlightName = 'knowte-note-search';
    private readonly currentHighlightName = 'knowte-note-search-current';
    private matchesByPane = new Map<HTMLElement, Range[]>();
    private currentIndex = 0;

    constructor(private renderer: SearchHighlightWindow = window as SearchHighlightWindow) {}

    public get matchCount(): number {
        return this.navigationMatches().length;
    }

    /** 1-based position of the current match, or 0 when there are no matches. */
    public get currentMatch(): number {
        return this.matchCount > 0 ? (this.currentIndex % this.matchCount) + 1 : 0;
    }

    public clear(): void {
        this.renderer.CSS?.highlights?.delete(this.highlightName);
        this.renderer.CSS?.highlights?.delete(this.currentHighlightName);
        this.matchesByPane.clear();
        this.currentIndex = 0;
    }

    public next(): void {
        this.goTo(this.currentIndex + 1);
    }

    public previous(): void {
        this.goTo(this.currentIndex - 1);
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
        const roots = document.querySelectorAll<HTMLElement>('#editor .ql-editor, .highlighted-content, #markdown-output');

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
            const ranges: Range[] = [];
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
                ranges.push(range);
            }
            if (ranges.length > 0) {
                this.matchesByPane.set(root, ranges);
            }
        }

        renderer.CSS.highlights.set(this.highlightName, highlight);
        for (const [root, ranges] of this.matchesByPane) {
            if (this.isVisible(root)) {
                this.scrollIntoView(root, ranges[0]);
            }
        }
        this.markCurrent();
        return true;
    }

    private goTo(index: number): void {
        const pane = this.navigationPane();
        if (!pane) {
            return;
        }
        const ranges = this.matchesByPane.get(pane);
        this.currentIndex = (index + ranges.length) % ranges.length;
        this.scrollIntoView(pane, ranges[this.currentIndex]);
        this.markCurrent();
    }

    private markCurrent(): void {
        const pane = this.navigationPane();
        if (!pane || !this.renderer.Highlight || !this.renderer.CSS?.highlights) {
            return;
        }
        const ranges = this.matchesByPane.get(pane);
        const current = new this.renderer.Highlight(ranges[this.currentIndex % ranges.length]);
        current.priority = 1;
        this.renderer.CSS.highlights.set(this.currentHighlightName, current);
    }

    // Navigates the pane the user sees first: the Markdown source while editing, otherwise the preview or rich-text editor.
    private navigationPane(): HTMLElement | undefined {
        const panes = Array.from(this.matchesByPane.keys());
        return panes.find((pane) => this.isVisible(pane)) || panes[0];
    }

    // The hidden Markdown source keeps its padding width, so width alone does not mean visible.
    private isVisible(pane: HTMLElement): boolean {
        const element = pane as HTMLElement & { checkVisibility?(options: { visibilityProperty: boolean }): boolean };
        return pane.offsetWidth > 0 && (!element.checkVisibility || element.checkVisibility({ visibilityProperty: true }));
    }

    private navigationMatches(): Range[] {
        const pane = this.navigationPane();
        return pane ? this.matchesByPane.get(pane) : [];
    }

    private scrollIntoView(root: HTMLElement, range: Range): void {
        const bounds = range.getBoundingClientRect();
        const offset = root.scrollTop + bounds.top - root.getBoundingClientRect().top;
        // The mirrored layer follows the textarea's scroll position, so scroll the textarea.
        const container = root.matches('.highlighted-content')
            ? root.parentElement?.querySelector<HTMLElement>('.markdown-input') || root
            : root;
        container.scrollTop = Math.max(0, offset - container.clientHeight / 2 + bounds.height / 2);
    }
}