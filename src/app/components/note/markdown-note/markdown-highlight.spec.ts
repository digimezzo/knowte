import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { SanitizeMarkdownPipe } from '../../../pipes/sanitize-markdown.pipe';
import { markdownHighlightExtension } from './markdown-highlight';

describe('Markdown highlighting', () => {
    beforeAll(() => marked.use(markdownHighlightExtension));

    it.each([
        ['Some ==highlighted text==.', '<p>Some <mark>highlighted text</mark>.</p>\n'],
        ['==one== and ==two==', '<p><mark>one</mark> and <mark>two</mark></p>\n'],
        ['==**bold** and *italic*==', '<p><mark><strong>bold</strong> and <em>italic</em></mark></p>\n'],
        ['**==highlight==**', '<p><strong><mark>highlight</mark></strong></p>\n'],
        ['==[link](https://example.com)==', '<p><mark><a href="https://example.com">link</a></mark></p>\n'],
        ['==first\nsecond==', '<p><mark>first\nsecond</mark></p>\n'],
        ['==& <b>text</b>==', '<p><mark>&amp; <b>text</b></mark></p>\n'],
    ])('renders %s', (source, expected) => {
        expect(marked.parse(source)).toBe(expected);
    });

    it.each([
        '`==code==`',
        '```\n==code==\n```',
        '    ==code==',
        '\\==escaped==',
        '==unfinished',
        '====',
        '[link](https://example.com/==path==)',
        '![==alt==](image.png)',
    ])('does not highlight literal markers in %s', (source) => {
        expect(marked.parse(source)).not.toContain('<mark>');
    });

    it('preserves escaped equals inside highlights', () => {
        expect(marked.parse('==one \\== two==')).toBe('<p><mark>one == two</mark></p>\n');
    });

    it('preserves highlights through Angular preview sanitization', () => {
        const sanitizer = TestBed.inject(DomSanitizer);
        const html = marked.parse('==**highlight**==');

        expect(sanitizer.sanitize(SecurityContext.HTML, html)).toBe('<p><mark><strong>highlight</strong></mark></p>&#10;');
    });

    it('preserves highlights while removing unsafe HTML through the Markdown pipe', () => {
        const pipe = new SanitizeMarkdownPipe();
        const html = marked.parse('==highlight==<script>alert(1)</script>');

        expect(pipe.transform(html)).toContain('<mark>highlight</mark>');
        expect(pipe.transform(html)).not.toContain('<script>');
    });
});
