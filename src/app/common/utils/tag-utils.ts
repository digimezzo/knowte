export class TagUtils {
    public static normalize(tags: string[] = []): string[] {
        if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
            throw new Error('Tags must be an array of strings.');
        }

        const seen: Set<string> = new Set();
        return tags.map((tag) => tag.trim()).filter((tag) => {
            const key: string = tag.toLowerCase();
            if (!key || seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    public static parseSearch(query: string): { tags: string[]; text: string } {
        let text: string = (query || '').trim();
        const tags: string[] = [];
        while (/^t:/i.test(text)) {
            const value: string = text.substring(2).trim();
            const match = value.startsWith('"')
                ? /^"([^"]*)"(?:\s+([\s\S]*))?$/.exec(value)
                : /^(\S+)(?:\s+([\s\S]*))?$/.exec(value);
            if (!match || !match[1].trim()) {
                return { tags: [''], text: '' };
            }
            tags.push(match[1].trim().toLowerCase());
            text = (match[2] || '').trim();
        }
        return { tags, text };
    }
}
