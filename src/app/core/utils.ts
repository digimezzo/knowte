export class Utils {
    public static async sleep(milliseconds: number) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    
    public static caseInsensitiveNameSort(object1: any, object2: any) {
        return object1.name.toLowerCase().localeCompare(object2.name.toLowerCase());
    }
}