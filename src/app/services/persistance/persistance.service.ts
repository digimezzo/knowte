import { Injectable } from '@angular/core';
import { BaseSettings } from '../../core/base-settings';
import { NoteExport } from '../../core/note-export';
import { Strings } from '../../core/strings';
import { CollectionFileAccess } from '../collection/collection-file-access';
import { CryptographyService } from '../cryptography/cryptography.service';

@Injectable()
export class PersistanceService {
    constructor(
        private collectionFileAccess: CollectionFileAccess,
        private cryptography: CryptographyService,
        private settings: BaseSettings
    ) {}

    public async getNoteContentAsync(noteId: string, isEncrypted: boolean, secretKey: string, isMarkdownNote: boolean): Promise<string> {
        const noteContent: string = await this.collectionFileAccess.getNoteContentByNoteIdAsync(
            noteId,
            this.settings.activeCollection,
            isMarkdownNote
        );

        if (isEncrypted && !Strings.isNullOrWhiteSpace(secretKey)) {
            return this.cryptography.decrypt(noteContent, secretKey);
        }

        return noteContent;
    }

    public async updateNoteContentAsync(
        noteId: string,
        noteJsonContent: string,
        isEncrypted: boolean,
        secretKey: string,
        isMarkdownNote: boolean
    ): Promise<void> {
        let contentToWrite: string = noteJsonContent;

        if (isEncrypted && !Strings.isNullOrWhiteSpace(secretKey)) {
            contentToWrite = this.cryptography.encrypt(noteJsonContent, secretKey);
        }

        await this.collectionFileAccess.saveNoteContentAsync(noteId, contentToWrite, this.settings.activeCollection, isMarkdownNote);
    }

    public async exportNoteAsync(
        exportFilePath: string,
        noteTitle: string,
        noteText: string,
        noteContent: string,
        isMarkdownNote: boolean
    ): Promise<void> {
        const noteExport: NoteExport = new NoteExport(noteTitle, noteText, noteContent, isMarkdownNote);
        await this.collectionFileAccess.saveNoteExportToFileAsync(exportFilePath, noteExport);
    }
}
