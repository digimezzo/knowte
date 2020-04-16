import * as path from 'path';
import sanitize from 'sanitize-filename';
import { Constants } from './constants';

export class Utils {
    public static async sleep(milliseconds: number): Promise<void> {
        return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
    }

    public static caseInsensitiveNameSort(object1: any, object2: any): any {
        return object1.name.toLowerCase().localeCompare(object2.name.toLowerCase());
    }

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
        for (let i: number = 0; i < items.length; i++) {
            const item: string = items[i].toLowerCase();

            if (text.toLowerCase().indexOf(item) < 0) {
                return false;
            }
        }

        return true;
    }

    public static pathToCollection(collectionDirectoryPath: string): string {
        return path.dirname(collectionDirectoryPath).split(path.sep).pop();
    }

    public static collectionToPath(storageDirectory: string, collection: string): string {
        return path.join(storageDirectory, collection);
    }

    public static getNoteExportPath(exportDirectory: string, noteTitle: string): string {
        return path.join(exportDirectory, `${sanitize(noteTitle)}${Constants.noteExportExtension}`);
    }

    public static getPdfExportPath(exportDirectory: string, noteTitle: string): string {
        return path.join(exportDirectory, `${sanitize(noteTitle)}.pdf`);
    }
}
