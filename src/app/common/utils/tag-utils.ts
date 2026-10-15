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

    public static parseSearch(query: string): { tag?: string; text: string } {
        const trimmedQuery: string = (query || '').trim();
        if (!/^t:/i.test(trimmedQuery)) {
            return { text: trimmedQuery };
        }

        const value: string = trimmedQuery.substring(2).trim();
        const match = value.startsWith('"')
            ? /^"([^"]*)"(?:\s+([\s\S]*))?$/.exec(value)
            : /^(\S+)(?:\s+([\s\S]*))?$/.exec(value);

        if (!match) {
            return { tag: '', text: '' };
        }

        return { tag: match[1].trim().toLowerCase(), text: (match[2] || '').trim() };
    }
}
