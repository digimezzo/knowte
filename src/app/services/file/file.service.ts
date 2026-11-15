import { Injectable } from '@angular/core';
import * as path from 'path';
import { Constants } from '../../common/application/constants';

type ElectronFile = File & { path: string };

@Injectable()
export class FileService {
    constructor() {}

    public isDroppingFiles(dropEvent: DragEvent): boolean {
        return this.getDroppedFilesPaths(dropEvent).length > 0;
    }

    public getDroppedFilesPaths(dropEvent: DragEvent): string[] {
        const dataTransfer: DataTransfer | null = dropEvent.dataTransfer;

        if (!dataTransfer) {
            return [];
        }

        const droppedFilesPaths: string[] = [];

        if (dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i: number = 0; i < dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them.
                if (dataTransfer.items[i].kind === 'file') {
                    const file: ElectronFile = dataTransfer.items[i].getAsFile() as ElectronFile;
                    droppedFilesPaths.push(file.path);
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (let i: number = 0; i < dataTransfer.files.length; i++) {
                droppedFilesPaths.push((dataTransfer.files[i] as ElectronFile).path);
            }
        }

        return droppedFilesPaths;
    }

    public getNoteFilePaths(filePaths: string[]): string[] {
        const noteFilePaths: string[] = filePaths.filter(
            (x) => path.extname(x) === Constants.classicNoteExportExtension || path.extname(x) === Constants.markdownNoteExportExtension,
        );

        return noteFilePaths;
    }
}
