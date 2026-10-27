import { NoteSearch } from './note-search';

describe('NoteSearch renderer highlights', () => {
    let search: NoteSearch;
    let highlights: Map<string, Set<Range>>;
    let root: HTMLElement;
    let originalBounds: PropertyDescriptor | undefined;

    beforeEach(() => {
        originalBounds = Object.getOwnPropertyDescriptor(Range.prototype, 'getBoundingClientRect');
        highlights = new Map();
        Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
            configurable: true,
            value: jest.fn().mockReturnValue({ top: 400, height: 20 }),
        });
        document.body.innerHTML = '<div id="markdown-output"><p>Alpha beta ALPHA</p></div>';
        root = document.getElementById('markdown-output');
        search = new NoteSearch({ Highlight: class extends Set<Range> {}, CSS: { highlights } });
    });

    afterEach(() => {
        if (originalBounds) {
            Object.defineProperty(Range.prototype, 'getBoundingClientRect', originalBounds);
        } else {
            Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect');
        }
        document.body.innerHTML = '';
    });

    function matches(): string[] {
        return Array.from(highlights.get('knowte-note-search') || []).map((range) => range.toString());
    }

    it('replaces an active query and clears all of its highlights', () => {
        expect(search.find('alpha')).toBe(true);
        expect(matches()).toEqual(['Alpha', 'ALPHA']);
        search.find('beta');
        expect(matches()).toEqual(['beta']);
        search.clear();
        expect(highlights.has('knowte-note-search')).toBe(false);
    });

    it('matches across inline formatting without modifying editor HTML', () => {
        root.innerHTML = '<p>Al<strong>ph</strong>a beta</p>';
        const html = root.innerHTML;
        search.find('alpha');
        expect(matches()).toEqual(['Alpha']);
        expect(root.innerHTML).toBe(html);
        search.clear();
        expect(root.innerHTML).toBe(html);
    });

    it('does not join words across separate paragraphs', () => {
        root.innerHTML = '<p>alpha</p><p>beta</p>';
        search.find('alphabeta');
        expect(matches()).toEqual([]);
    });

    it('treats regular expression characters as literal text', () => {
        root.textContent = 'a+b ab A+B [item]';
        search.find('a+b');
        expect(matches()).toEqual(['a+b', 'A+B']);
        search.find('[item]');
        expect(matches()).toEqual(['[item]']);
    });

    it('centers the first match in its scroll container', () => {
        root.scrollTop = 500;
        Object.defineProperty(root, 'clientHeight', { configurable: true, value: 200 });
        jest.spyOn(root, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);
        search.find('alpha');
        expect(root.scrollTop).toBe(710);
        expect(Range.prototype.getBoundingClientRect).toHaveBeenCalledTimes(1);
    });

    it('works with classic editor content and leaves unrelated highlights alone', () => {
        root.id = 'editor';
        root.innerHTML = '<div class="ql-editor"><p>Alpha beta</p></div>';
        const other = new Set<Range>();
        highlights.set('spelling', other);
        search.find('alpha');
        expect(matches()).toEqual(['Alpha']);
        search.clear();
        expect(highlights.get('spelling')).toBe(other);
    });

    it('removes existing highlights for an empty query or an unmatched query', () => {
        search.find('alpha');
        search.find('');
        expect(highlights.has('knowte-note-search')).toBe(false);
        search.find('alpha');
        search.find('missing');
        expect(matches()).toEqual([]);
    });

    it('allows native fallback on renderers without the Highlight API', () => {
        expect(new NoteSearch({}).find('alpha')).toBe(false);
    });
});