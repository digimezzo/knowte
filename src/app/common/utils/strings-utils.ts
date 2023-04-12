export class StringUtils {
    public static replaceFirst(sourceString: string, oldValue: string, newValue: string): string {
        return sourceString.replace(oldValue, newValue);
    }

    public static replaceAll(sourceString: string, oldValue: string, newValue: string): string {
        return sourceString.split(oldValue).join(newValue);
    }

    public static isNullOrWhiteSpace(stringToCheck: string): boolean {
        if (stringToCheck == undefined) {
            return true;
        }

        try {
            if (stringToCheck.trim() === '') {
                return true;
            }
        } catch (error) {
            return true;
        }

        return false;
    }
}
