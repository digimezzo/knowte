import { Injectable } from '@angular/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseSettings } from '../../core/base-settings';
import { Constants } from '../../core/constants';
import { NoteExport } from '../../core/note-export';
import { Strings } from '../../core/strings';
import { Utils } from '../../core/utils';
import { CryptographyService } from '../cryptography/cryptography.service';

@Injectable()
export class PersistanceService {
    constructor(private cryptography: CryptographyService, private settings: BaseSettings) {}

    public async getNoteContentAsync(noteId: string, isEncrypted: boolean, secretKey: string): Promise<string> {
        const activeCollection: string = this.settings.activeCollection;
        const storageDirectory: string = this.settings.storageDirectory;
        const activeCollectionDirectory: string = Utils.collectionToPath(storageDirectory, activeCollection);
        const noteContentFileName: string = `${this.createNoteFileName(noteId)}`;
        const noteContentFileFullPath: string = path.join(activeCollectionDirectory, noteContentFileName);

        const noteContent: string = await fs.readFile(noteContentFileFullPath, 'utf8');

        if (isEncrypted && !Strings.isNullOrWhiteSpace(secretKey)) {
            return this.cryptography.decrypt(noteContent, secretKey);
        }

        return noteContent;
    }

    public updateNoteContent(noteId: string, noteJsonContent: string, isEncrypted: boolean, secretKey: string): void {
        const activeCollection: string = this.settings.activeCollection;
        const storageDirectory: string = this.settings.storageDirectory;

        const noteFilePath: string = path.join(
            Utils.collectionToPath(storageDirectory, activeCollection),
            `${this.createNoteFileName(noteId)}`
        );

        let contentToWrite: string = noteJsonContent;

        if (isEncrypted && !Strings.isNullOrWhiteSpace(secretKey)) {
            contentToWrite = this.cryptography.encrypt(noteJsonContent, secretKey);
        }

        fs.writeFileSync(noteFilePath, contentToWrite);
    }

    public async exportNoteAsync(exportFilePath: string, noteTitle: string, noteText: string, noteJsonContent: string): Promise<void> {
        const noteExport: NoteExport = new NoteExport(noteTitle, noteText, noteJsonContent);

        await fs.writeFile(exportFilePath, JSON.stringify(noteExport));
    }

    private createNoteFileName(noteId: string): string {
        return `${noteId}${Constants.noteContentExtension}`;
    }
}
