import * as path from 'path';
import * as Store from 'electron-store';
import * as sanitize from 'sanitize-filename';
import { Constants } from './constants';

export class Utils {
    public static async sleep(milliseconds: number) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    public static caseInsensitiveNameSort(object1: any, object2: any) {
        return object1.name.toLowerCase().localeCompare(object2.name.toLowerCase());
    }

    public static containsAny(text: string, items: string[]) {
        for (let i: number = 0; i < items.length; i++) {
            let item: string = items[i].toLowerCase();

            if (text.toLowerCase().indexOf(item) > -1) {
                return true;
            }
        }

        return false;
    }

    public static containsAll(text: string, items: string[]) {
        for (let i: number = 0; i < items.length; i++) {
            let item: string = items[i].toLowerCase();

            if (text.toLowerCase().indexOf(item) < 0) {
                return false;
            }
        }

        return true;
    }

    public static pathToCollection(collectionDirectoryPath: string): string {
        return path.dirname(collectionDirectoryPath).split(path.sep).pop();
    }

    public static collectionToPath(collection: string): string {
        let settings: Store = new Store();
        let storageDirectory: string = settings.get('storageDirectory');

        return path.join(storageDirectory, collection);
    }

    public static getNoteExportPath(exportDirectory: string, noteTitle: string) {
        return path.join(exportDirectory, `${sanitize(noteTitle)}${Constants.noteExportExtension}`);
    }
}