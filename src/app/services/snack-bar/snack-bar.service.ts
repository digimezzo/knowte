import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatorService } from '../translator/translator.service';

@Injectable({
    providedIn: 'root',
})
export class SnackBarService {
    constructor(private zone: NgZone, private translator: TranslatorService, private matSnackBar: MatSnackBar) {}

    public async duplicateCollectionAsync(collection: string): Promise<void> {
        const message: string = await this.translator.getAsync('SnackBarMessages.DuplicateCollection', { collection: collection });
        const action: string = await this.translator.getAsync('SnackBarActions.Ok');
        this.showActionSnackBar(message, action, false);
    }

    public async duplicateNotebookAsync(notebookName: string): Promise<void> {
        const message: string = await this.translator.getAsync('SnackBarMessages.DuplicateNotebook', { notebookName: notebookName });
        const action: string = await this.translator.getAsync('SnackBarActions.Ok');
        this.showActionSnackBar(message, action, false);
    }

    public async noteTitleCannotBeEmptyAsync(): Promise<void> {
        const message: string = await this.translator.getAsync('SnackBarMessages.NoteTitleCannotBeEmpty');
        const action: string = await this.translator.getAsync('SnackBarActions.Ok');
        this.showActionSnackBar(message, action, false);
    }

    public async closeNoteBeforeChangingCollectionsAsync(): Promise<void> {
        const message: string = await this.translator.getAsync('SnackBarMessages.CloseNoteBeforeChangingCollections');
        const action: string = await this.translator.getAsync('SnackBarActions.Ok');
        this.showActionSnackBar(message, action, false);
    }

    public async noteExportedAsync(noteTitle: string): Promise<void> {
        const message: string = await this.translator.getAsync('SnackBarMessages.NoteExported', { noteTitle: noteTitle });
        const action: string = await this.translator.getAsync('SnackBarActions.Ok');
        this.showActionSnackBar(message, action, false);
    }

    public async noteMovedToNotebookAsync(notebookName: string): Promise<void> {
        const message: string = await this.translator.getAsync('SnackBarMessages.NoteMovedToNotebook', { notebookName: notebookName });
        const action: string = await this.translator.getAsync('SnackBarActions.Ok');
        this.showActionSnackBar(message, action, false);
    }

    public async notesMovedToNotebookAsync(notebookName: string): Promise<void> {
        const message: string = await this.translator.getAsync('SnackBarMessages.NotesMovedToNotebook', { notebookName: notebookName });
        const action: string = await this.translator.getAsync('SnackBarActions.Ok');
        this.showActionSnackBar(message, action, false);
    }

    public async notesImportedIntoNotebookAsync(notebookName: string): Promise<void> {
        const message: string = await this.translator.getAsync('SnackBarMessages.NotesImportedIntoNotebook', {
            notebookName: notebookName,
        });
        const action: string = await this.translator.getAsync('SnackBarActions.Ok');
        this.showActionSnackBar(message, action, false);
    }

    public async notesImportedAsync(): Promise<void> {
        const message: string = await this.translator.getAsync('SnackBarMessages.NotesImported');
        const action: string = await this.translator.getAsync('SnackBarActions.Ok');
        this.showActionSnackBar(message, action, false);
    }

    public async noNoteFilesToImportAsync(): Promise<void> {
        const message: string = await this.translator.getAsync('SnackBarMessages.NoNoteFilesToImport');
        const action: string = await this.translator.getAsync('SnackBarActions.Ok');
        this.showActionSnackBar(message, action, false);
    }

    private showActionLessSnackBar(message: string): void {
        this.zone.run(() => {
            this.matSnackBar.open(message, '', { duration: this.calculateDuration(message) });
        });
    }

    private showActionSnackBar(message: string, action: string, keepOpen: boolean): void {
        let config: any = { duration: this.calculateDuration(message) };

        if (keepOpen) {
            config = {};
        }

        this.matSnackBar.open(message, action, config);
    }

    private calculateDuration(message: string): number {
        // See: https://ux.stackexchange.com/questions/11203/how-long-should-a-temporary-notification-toast-appear
        // We assume a safe reading speed of 150 words per minute and an average of 5.8 characters per word in the English language.
        // Then, approx. 1 character is read every 70 milliseconds. Adding a margin of 5 milliseconds, gives us 75 ms.
        return Math.min(Math.max(message.length * 75, 2000), 7000);
    }
}
