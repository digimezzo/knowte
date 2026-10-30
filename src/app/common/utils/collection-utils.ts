export class CollectionUtils {
    public static containsAny(text: string, items: string[]): boolean {
        for (let i: number = 0; i < items.length; i++) {
            const item: string = items[i].toLowerCase();

            if (text.toLowerCase().indexOf(item) > -1) {
                return true;
            }
        }

        return false;
    }

    public static containsAll(text: string, items: string[]): boolean {
        const lowerCaseText: string = text.toLowerCase();

        for (let i: number = 0; i < items.length; i++) {
            const item: string = items[i].toLowerCase();

            if (lowerCaseText.indexOf(item) < 0) {
                return false;
            }
        }

        return true;
    }
}
