import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { marked, Renderer } from 'marked';
import { createNoteLink, getLinkedNoteId, getNoteLinkPreviewHref } from './note-link';
import { markdownHighlightExtension } from '../../components/note/markdown-note/markdown-highlight';

describe('Note link Markdown', () => {
    beforeAll(() => marked.use(markdownHighlightExtension));
    const renderer = new Renderer();
    renderer.link = (href, title, text) => Renderer.prototype.link.call(
        renderer, href ? getNoteLinkPreviewHref(href) : href, title, text,
    );

    it.each(['AbC_123-xyz', 'target'])('preserves case-sensitive IDs: %s', (id) => {
        const source = createNoteLink(id, 'A note');
        const html = marked.parse(source, { renderer });
        const sanitized = TestBed.inject(DomSanitizer).sanitize(SecurityContext.HTML, html);
        const container = document.createElement('div');
        container.innerHTML = sanitized;
        const href = container.querySelector('a').getAttribute('href');
        expect(href).toBe(`#knowte-note/${id}`);
        expect(getLinkedNoteId(href)).toBe(id);
    });

    it.each([
        'Title [with] brackets (and parentheses)',
        'A **bold** _title_ with `code` and ![image]',
        '<img src=x onerror=alert(1)> & "quotes"',
        'A \\ backslash',
        'Literal &copy; and &#65; entities',
        'A ==highlighted== title',
    ])('escapes labels without creating extra markup: %s', (title) => {
        const container = document.createElement('div');
        container.innerHTML = marked.parse(createNoteLink('target', title), { renderer });
        expect(container.querySelector('a').textContent).toBe(title);
        expect(container.querySelectorAll('a')).toHaveLength(1);
        expect(container.querySelectorAll('img, strong, em, code')).toHaveLength(0);
    });

    it.each([
        'knowte://note/',
        'knowte://note/target/extra',
        'knowte://note/../target',
        'knowte://note/target?other=1',
        'knowte://other/target',
        'https://example.org',
    ])('does not resolve invalid link %s', (href) => {
        expect(getLinkedNoteId(href)).toBeUndefined();
    });

    it('leaves ordinary web links unchanged', () => {
        expect(marked.parse('[Web](https://example.org)', { renderer })).toContain('href="https://example.org"');
    });

    it('keeps malformed internal links local so clicks can report the error', () => {
        expect(getNoteLinkPreviewHref('knowte://note/')).toBe('#knowte-note/');
    });

    it('does not convert code snippets or images into note links', () => {
        const html = marked.parse('`[Note](knowte://note/target)`\n\n![Image](knowte://note/target)', { renderer });
        expect(html).not.toContain('<a ');
    });
});
