import { marked } from 'marked';
import { markdownUncPathExtension } from './markdown-unc-path';

describe('Markdown UNC paths', () => {
    beforeAll(() => marked.use(markdownUncPathExtension));

    it('renders bare UNC paths as text while preserving both leading backslashes', () => {
        const container = document.createElement('div');
        container.innerHTML = marked.parse(String.raw`\\server\share\folder`);

        expect(container.querySelector('a')).toBeNull();
        expect(container.textContent.trim()).toBe(String.raw`\\server\share\folder`);
    });

    it('does not create nested links inside an existing Markdown link', () => {
        const container = document.createElement('div');
        container.innerHTML = marked.parse(String.raw`[path \\server\share](https://example.org)`);

        expect(container.querySelectorAll('a')).toHaveLength(1);
        expect(container.querySelector('a').getAttribute('href')).toBe('https://example.org');
    });

    it('does not turn incomplete network paths into links', () => {
        const container = document.createElement('div');
        container.innerHTML = marked.parse(String.raw`\\server`);

        expect(container.querySelector('a')).toBeNull();
    });
});
