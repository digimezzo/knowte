import { Injectable } from '@angular/core';
import { BaseSettings } from '../../common/settings/base-settings';
import { StringUtils } from '../../common/utils/strings-utils';
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

        if (isEncrypted && !StringUtils.isNullOrWhiteSpace(secretKey)) {
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

        if (isEncrypted && !StringUtils.isNullOrWhiteSpace(secretKey)) {
            contentToWrite = this.cryptography.encrypt(noteJsonContent, secretKey);
        }

        await this.collectionFileAccess.saveNoteContentAsync(noteId, contentToWrite, this.settings.activeCollection, isMarkdownNote);
    }

    public async exportNoteAsync(
        exportFilePath: string,
        noteId: string,
        noteTitle: string,
        noteText: string,
        noteContent: string,
        isMarkdownNote: boolean
    ): Promise<void> {
        await this.collectionFileAccess.exportNoteAsync(exportFilePath, noteId, noteTitle, noteText, noteContent, isMarkdownNote);
    }
}
