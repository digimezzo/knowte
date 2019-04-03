import { Injectable } from '@angular/core';
import { CollectionService } from './collection.service';
import log from 'electron-log';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    constructor() { }

    public getPathsOfDroppedFiles(dropEvent: any): string[] {
        let pathsOfDroppedFiles: string[] = [];

        if (dropEvent.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i: number = 0; i < dropEvent.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them.
                if (dropEvent.dataTransfer.items[i].kind === 'file') {
                    let file: any = dropEvent.dataTransfer.items[i].getAsFile();
                    pathsOfDroppedFiles.push(file.path);
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (let i: number = 0; i < dropEvent.dataTransfer.files.length; i++) {
                pathsOfDroppedFiles.push(dropEvent.dataTransfer.files[i].path);
            }
        }

        log.info(`Paths of dropped files: ${pathsOfDroppedFiles}`);

        return pathsOfDroppedFiles;
    }
}