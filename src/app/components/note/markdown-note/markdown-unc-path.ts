import { marked } from 'marked';

const uncPathPattern = /^\\\\[^\\/\s]+(?:\\[^\\/\s]+)+/;

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const markdownUncPathExtension: marked.MarkedExtension = {
    extensions: [
        {
            name: 'uncPath',
            level: 'inline',
            start(source) {
                const index = source.indexOf('\\\\');
                return index >= 0 ? index : undefined;
            },
            tokenizer(source) {
                if (this.lexer.state.inLink) {
                    return;
                }
                const match = uncPathPattern.exec(source);
                if (match) {
                    return { type: 'uncPath', raw: match[0] };
                }
            },
            renderer(token) {
                return escapeHtml(token.raw as string);
            },
        },
    ],
};
