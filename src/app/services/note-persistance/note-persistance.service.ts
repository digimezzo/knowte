import { Injectable } from '@angular/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseSettings } from '../../core/base-settings';
import { Constants } from '../../core/constants';
import { NoteExport } from '../../core/note-export';
import { Utils } from '../../core/utils';

@Injectable()
export class NotePersistanceService {
    public constructor(private settings: BaseSettings) {}

    public updateNoteContent(noteId: string, noteJsonContent: string): void {
        const activeCollection: string = this.settings.activeCollection;
        const storageDirectory: string = this.settings.storageDirectory;

        const noteFilePath: string = path.join(
            Utils.collectionToPath(storageDirectory, activeCollection),
            `${this.createNoteFileName(noteId)}`
        );

        fs.writeFileSync(noteFilePath, noteJsonContent);
    }

    public async getNoteContentAsync(noteId: string): Promise<string> {
        const activeCollection: string = this.settings.activeCollection;
        const storageDirectory: string = this.settings.storageDirectory;
        const activeCollectionDirectory: string = Utils.collectionToPath(storageDirectory, activeCollection);
        const noteContentFileName: string = `${this.createNoteFileName(noteId)}`;
        const noteContentFileFullPath: string = path.join(activeCollectionDirectory, noteContentFileName);

        const noteContent: string = await fs.readFile(noteContentFileFullPath, 'utf8');

        return noteContent;
    }

    public async exportNoteAsync(exportFilePath: string, noteTitle: string, noteText: string, noteJsonContent: string): Promise<void> {
        const noteExport: NoteExport = new NoteExport(noteTitle, noteText, noteJsonContent);

        await fs.writeFile(exportFilePath, JSON.stringify(noteExport));
    }

    private createNoteFileName(noteId: string): string {
        return `${noteId}${Constants.noteContentExtension}`;
    }
}
