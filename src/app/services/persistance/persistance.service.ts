import { Injectable } from '@angular/core';
import { NoteExport } from '../../core/note-export';
import { Strings } from '../../core/strings';
import { CollectionFileAccess } from '../collection/collection-file-access';
import { CryptographyService } from '../cryptography/cryptography.service';

@Injectable()
export class PersistanceService {
    constructor(private collectionFileAccess: CollectionFileAccess, private cryptography: CryptographyService) {}

    public async getNoteContentAsync(noteId: string, isEncrypted: boolean, secretKey: string): Promise<string> {
        const noteContent: string = await this.collectionFileAccess.getNoteContentByNoteIdAsync(noteId);

        if (isEncrypted && !Strings.isNullOrWhiteSpace(secretKey)) {
            return this.cryptography.decrypt(noteContent, secretKey);
        }

        return noteContent;
    }

    public async updateNoteContentAsync(noteId: string, noteJsonContent: string, isEncrypted: boolean, secretKey: string): Promise<void> {
        const noteFilePath: string = this.collectionFileAccess.createNoteContentFilePath(noteId);

        let contentToWrite: string = noteJsonContent;

        if (isEncrypted && !Strings.isNullOrWhiteSpace(secretKey)) {
            contentToWrite = this.cryptography.encrypt(noteJsonContent, secretKey);
        }

        await this.collectionFileAccess.saveNoteContentAsync(noteFilePath, contentToWrite);
    }

    public async exportNoteAsync(exportFilePath: string, noteTitle: string, noteText: string, noteJsonContent: string): Promise<void> {
        const noteExport: NoteExport = new NoteExport(noteTitle, noteText, noteJsonContent);
        await this.collectionFileAccess.saveNoteExportToFileAsync(exportFilePath, noteExport);
    }
}
