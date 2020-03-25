import { Injectable } from '@angular/core';
import * as path from 'path';
import { CollectionService } from '../collection/collection.service';
import { Constants } from '../../core/constants';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    constructor(private collection: CollectionService) { }

    public isDroppingFiles(dropEvent: any): boolean {
        return this.getDroppedFilesPaths(dropEvent).length > 0;
    }

    public getDroppedFilesPaths(dropEvent: any): string[] {
        const droppedFilesPaths: string[] = [];

        if (dropEvent.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i: number = 0; i < dropEvent.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them.
                if (dropEvent.dataTransfer.items[i].kind === 'file') {
                    const file: any = dropEvent.dataTransfer.items[i].getAsFile();
                    droppedFilesPaths.push(file.path);
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (let i: number = 0; i < dropEvent.dataTransfer.files.length; i++) {
                droppedFilesPaths.push(dropEvent.dataTransfer.files[i].path);
            }
        }

        return droppedFilesPaths;
    }

    public getNoteFilePaths(filePaths: string[]): string[] {
        const noteFilePaths: string[] = filePaths.filter(x =>  path.extname(x) === Constants.noteExportExtension);

        return noteFilePaths;
    }
}
