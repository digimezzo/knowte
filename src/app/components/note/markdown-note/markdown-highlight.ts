import { marked } from 'marked';

export const markdownHighlightExtension: marked.MarkedExtension = {
    extensions: [
        {
            name: 'mark',
            level: 'inline',
            start(source) {
                return source.indexOf('==');
            },
            tokenizer(source) {
                const match = /^==(?=\S)((?:\\[\s\S]|[^\\])+?)==/.exec(source);

                if (match) {
                    return {
                        type: 'mark',
                        raw: match[0],
                        tokens: this.lexer.inlineTokens(match[1]),
                    };
                }
            },
            renderer(token) {
                return `<mark>${this.parser.parseInline(token.tokens)}</mark>`;
            },
        },
    ],
};
