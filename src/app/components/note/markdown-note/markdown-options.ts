import { marked, Tokens } from 'marked';
import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { getNoteLinkPreviewHref } from '../../../common/utils/note-link';
import { markdownHighlightExtension } from './markdown-highlight';
import { markdownUncPathExtension } from './markdown-unc-path';

marked.use(markdownHighlightExtension);
marked.use(markdownUncPathExtension);

export function MarkedOptionsFactory(): MarkedOptions {
    const renderer = new MarkedRenderer();
    const htmlEscapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

    renderer.link = function (token: Tokens.Link) {
        const href = token.href ? getNoteLinkPreviewHref(token.href) : token.href;
        return MarkedRenderer.prototype.link.call(this, { ...token, href }) as string;
    };

    renderer.code = function (token: Tokens.Code) {
        const language = token.lang?.trim().split(/\s+/, 1)[0].toLowerCase();
        if (language === 'mermaid') {
            const escapedCode = token.text.replace(/[&<>]/g, (c) => htmlEscapes[c] ?? c);
            return `<pre class="mermaid">${escapedCode}</pre>`;
        }
        return MarkedRenderer.prototype.code.call(this, token) as string;
    };

    renderer.list = function (token: Tokens.List) {
        const html = MarkedRenderer.prototype.list.call(this, token) as string;
        const divElement = document.createElement('div');
        divElement.innerHTML = html;

        divElement.querySelectorAll('li').forEach((li) => {
            li.childNodes.forEach((child) => {
                if (child instanceof HTMLInputElement && child.type === 'checkbox') {
                    li.classList.add('task-list-item');
                    const checkbox = document.createElement('span');
                    checkbox.classList.add('task-list-checkbox');
                    if (child.checked) {
                        checkbox.classList.add('task-list-checkbox-checked');
                    }
                    child.replaceWith(checkbox);
                }
            });
        });

        return divElement.innerHTML;
    };

    return { renderer };
}
