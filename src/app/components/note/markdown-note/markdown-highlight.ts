import { MarkedExtension, Tokens } from 'marked';

export const markdownHighlightExtension: MarkedExtension = {
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
    renderer: {
        image(token: Tokens.Image) {
            // Alt text must stay plain: drop the inline tokens so extensions
            // like ==mark== are not rendered inside it.
            delete (token as { tokens?: unknown }).tokens;
            // Returning false falls back to marked's default image renderer,
            // which then uses the plain `text`.
            return false;
        },
    },
};