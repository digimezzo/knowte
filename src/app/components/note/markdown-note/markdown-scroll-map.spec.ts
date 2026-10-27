import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { buildSourceBlocks, interpolateScroll, MarkdownScrollMap } from './markdown-scroll-map';

const options: marked.MarkedOptions = { headerIds: false, mangle: false };

function rect(top: number, height: number): DOMRect {
    return { x: 0, y: top, width: 300, height, top, bottom: top + height, left: 0, right: 300, toJSON: () => ({ top, height }) };
}

describe('Markdown source blocks', () => {
    let sanitize: (html: string) => string;

    beforeEach(() => {
        const sanitizer = TestBed.inject(DomSanitizer);
        sanitize = (html) => sanitizer.sanitize(SecurityContext.HTML, html) || '';
    });

    function blocks(source: string, renderedSource = source) {
        const preview = document.createElement('div');
        preview.innerHTML = sanitize(marked.parse(renderedSource, options));
        return buildSourceBlocks(source, preview, options, sanitize);
    }

    it('locates headings, paragraphs, images, and fenced code including blank lines', () => {
        const source = '# Title\n\nParagraph\n\n![image](image.png)\n\n```\ncode\n```\n';
        expect(blocks(source).map((block) => [block.startLine, block.endLine, block.first.nodeName])).toEqual([
            [0, 1, 'H1'], [2, 3, 'P'], [4, 5, 'P'], [6, 9, 'PRE'],
        ]);
    });

    it('accounts for non-rendered reference definitions and repeated text', () => {
        const source = '[ref]: https://example.org\n\nsame [ref]\n\nsame [ref]\n';
        expect(blocks(source).map((block) => block.startLine)).toEqual([2, 4]);
        expect(blocks('[ref]: /Paragraph\n\nParagraph\n\nParagraph').map((block) => block.startLine)).toEqual([2, 4]);
    });

    it('handles CRLF and ngx-markdown indentation normalization without shifting source lines', () => {
        expect(blocks('  # Title\r\n\r\n  Paragraph', '# Title\n\nParagraph').map((block) => block.startLine)).toEqual([0, 2]);
        expect(blocks('# Title\n\n\tcode\n\nAfter').map((block) => [block.startLine, block.first.nodeName])).toEqual([
            [0, 'H1'], [2, 'PRE'], [4, 'P'],
        ]);
    });

    it('provides individual anchors for task-list items and table rows', () => {
        const source = '- [ ] One\n- [x] Two\n\nA | B\n--|--\nC | D\nE | F\n';
        expect(blocks(source).map((block) => [block.startLine, block.first.nodeName])).toEqual([
            [0, 'UL'], [0, 'LI'], [1, 'LI'], [3, 'TABLE'], [3, 'TR'], [5, 'TR'], [6, 'TR'],
        ]);
    });

    it('keeps nested lists and quotes attached to their containing source block', () => {
        const source = '> First\n>\n> Second\n\n- One\n  - Nested\n- Two\n';
        expect(blocks(source).map((block) => [block.startLine, block.first.nodeName])).toEqual([
            [0, 'BLOCKQUOTE'], [4, 'UL'], [4, 'LI'], [6, 'LI'],
        ]);
    });

    it.each(['- ', '* ', '+ ', '2. ', '2) '])('maps an unfinished list item ending in a space (%s)', (item) => {
        const first = item.startsWith('2') ? `1${item[1]} One` : `${item[0]} One`;
        const source = `# Title\n\n${first}\n${item}`;
        expect(blocks(source).map((block) => [block.startLine, block.endLine, block.first.nodeName])).toEqual([
            [0, 1, 'H1'], [2, 4, item.startsWith('2') ? 'OL' : 'UL'], [2, 3, 'LI'], [3, 4, 'LI'],
        ]);
    });

    it('preserves subsequent source positions after list trailing whitespace', () => {
        const source = '- One\n- Two \n\n# After\n\n- Three\n- ';
        expect(blocks(source).map((block) => [block.startLine, block.endLine, block.first.nodeName])).toEqual([
            [0, 2, 'UL'], [0, 1, 'LI'], [1, 2, 'LI'], [3, 4, 'H1'],
            [5, 7, 'UL'], [5, 6, 'LI'], [6, 7, 'LI'],
        ]);
        expect(blocks('- One\n# After').map((block) => [block.startLine, block.endLine, block.first.nodeName])).toEqual([
            [0, 1, 'UL'], [0, 1, 'LI'], [1, 2, 'H1'],
        ]);
    });

    it('handles HTML with multiple root elements and sanitized content without altering the preview', () => {
        const source = '<div>One</div><div>Two</div>\n\nAfter';
        const mapped = blocks(source);
        expect(mapped[0].first.textContent).toBe('One');
        expect(mapped[0].last.textContent).toBe('Two');
        expect(mapped[1].startLine).toBe(2);
        expect(blocks('<!-- comment -->\n\nAfter')[0].startLine).toBe(2);
    });

    it('reports mismatched rendering instead of silently mapping the wrong blocks', () => {
        expect(() => blocks('# Title', 'Paragraph')).toThrow('does not match');
    });
});

describe('Measured Markdown scroll map', () => {
    const source = '# Start\n\nWrapped paragraph\n\n![image](image.png)\n\n## Target\n\nTail';
    let input: HTMLTextAreaElement;
    let preview: HTMLElement;
    let map: MarkdownScrollMap;
    let linePositions: number[];
    let previewPositions: number[];
    let previewHeights: number[];
    let wrapper: HTMLElement;

    beforeEach(() => {
        wrapper = document.createElement('div');
        input = document.createElement('textarea');
        preview = document.createElement('div');
        wrapper.append(input, preview);
        document.body.append(wrapper);
        input.value = source;
        preview.innerHTML = marked.parse(source, options);
        Object.defineProperties(input, {
            clientWidth: { value: 300 },
            clientHeight: { value: 100 },
            scrollHeight: { value: 1100 },
        });
        Object.defineProperties(preview, {
            clientHeight: { value: 100 },
            scrollHeight: { value: 2100 },
        });
        const style = document.createElement('div').style;
        style.paddingTop = '16px';
        jest.spyOn(window, 'getComputedStyle').mockReturnValue(style);
        jest.spyOn(preview, 'getBoundingClientRect').mockImplementation(() => rect(100, 100));
        linePositions = [0, 20, 40, 140, 160, 180, 200, 220, 240, 260];
        previewPositions = [0, 100, 300, 920, 1000];
        previewHeights = [40, 150, 600, 40, 600];
        Array.from(preview.children).forEach((element, index) => {
            jest.spyOn(element, 'getBoundingClientRect').mockImplementation(
                () => rect(116 + previewPositions[index] - preview.scrollTop, previewHeights[index]),
            );
        });
        map = new MarkdownScrollMap(input, preview, options, (html) => html);
        map.update(source);
        const mirror = wrapper.querySelector('.markdown-scroll-measurement');
        jest.spyOn(mirror, 'getBoundingClientRect').mockReturnValue(rect(0, 300));
        Array.from(mirror.children).forEach((element, index) => {
            jest.spyOn(element, 'getClientRects').mockImplementation(() => {
                const bounds = rect(16 + linePositions[index], 20);
                return Object.assign([bounds], { item: (i: number) => i === 0 ? bounds : null });
            });
        });
    });

    afterEach(() => {
        map.destroy();
        wrapper.remove();
        jest.restoreAllMocks();
    });

    it('aligns the same heading within one pixel despite wrapped editor text and a large image', () => {
        expect(Math.abs(map.position(200, true) - 920)).toBeLessThan(1);
        expect(Math.abs(map.position(920, false) - 200)).toBeLessThan(1);
        expect(map.position(200, true)).not.toBe(400);
    });

    it('interpolates within an image block in both directions', () => {
        expect(map.position(170, true)).toBe(600);
        expect(map.position(600, false)).toBe(170);
    });

    it('remeasures after images or font sizes change and retains the same heading', () => {
        expect(map.position(200, true)).toBe(920);
        previewPositions[3] = 1320;
        previewHeights[2] = 1000;
        previewPositions[4] = 1400;
        linePositions[6] = 280;
        linePositions[7] = 300;
        linePositions[8] = 320;
        linePositions[9] = 340;
        map.invalidate();
        expect(map.position(280, true)).toBe(1320);
        expect(map.position(1320, false)).toBe(280);
    });

    it('measures positions independently of the current preview scroll offset', () => {
        preview.scrollTop = 700;
        expect(map.position(200, true)).toBe(920);
    });

    it('preserves exact endpoints and monotonic movement in both directions', () => {
        expect(map.position(0, true)).toBe(0);
        expect(map.position(1000, true)).toBe(2000);
        expect(map.position(2000, false)).toBe(1000);
        let previous = 0;
        for (let position = 0; position <= 1000; position += 10) {
            const target = map.position(position, true);
            expect(target).toBeGreaterThanOrEqual(previous);
            expect(map.position(target, false)).toBeCloseTo(position);
            previous = target;
        }
    });

    it('copies editor font overrides and uses its scrollbar-excluded width', () => {
        input.style.fontSize = '22px';
        map.position(200, true);
        const mirror = wrapper.querySelector<HTMLElement>('.markdown-scroll-measurement');
        expect(mirror.style.fontSize).toBe('22px');
        expect(mirror.style.width).toBe('300px');
        expect(mirror.getAttribute('aria-hidden')).toBe('true');
        expect(mirror.children[2].textContent).toBe('Wrapped paragraph');
    });
});

describe('Scroll interpolation', () => {
    it('handles a non-scrollable or empty note', () => {
        expect(interpolateScroll(0, [{ editor: 0, preview: 0 }], true)).toBe(0);
        expect(interpolateScroll(0, [{ editor: 0, preview: 0 }], false)).toBe(0);
    });
});
