import { Injectable } from '@angular/core';
import { Operation } from '../../core/enums';
import { CollectionService } from '../../services/collection/collection.service';
import { NoteOperationResult } from '../../services/results/note-operation-result';
import { TranslatorService } from '../../services/translator/translator.service';

@Injectable()
export class NoteCreator {
    public constructor(private collectionService: CollectionService, private translatorService: TranslatorService) {}

    public async createStandardNoteAsync(notebookId: string): Promise<void> {
        await this.createNoteAsync(notebookId, false);
    }

    public async createMarkdownNoteAsync(notebookId: string): Promise<void> {
        await this.createNoteAsync(notebookId, true);
    }

    private async createNoteAsync(notebookId: string, isMarkdownNote: boolean): Promise<void> {
        const result: NoteOperationResult = await this.collectionService.addNoteAsync(notebookId, isMarkdownNote);

        if (result.operation === Operation.Success) {
            await this.collectionService.setNoteOpenAsync(result.noteId, true);
        }
    }
}
