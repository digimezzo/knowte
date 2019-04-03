import { Injectable, NgZone } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatSnackBar } from "@angular/material";

@Injectable({
    providedIn: 'root',
})
export class SnackBarService {
    constructor(private zone: NgZone, private translate: TranslateService, private snackBar: MatSnackBar) {
    }

    public async duplicateCollectionAsync(collection: string) {
        let message: string = await this.translate.get('SnackBarMessages.DuplicateCollection', { collection: collection }).toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();
        this.showActionSnackBar(message, action);
    }

    public async duplicateNotebookAsync(notebookName: string) {
        let message: string = await this.translate.get('SnackBarMessages.DuplicateNotebook', { notebookName: notebookName }).toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();
        this.showActionSnackBar(message, action);
    }

    public async noteTitleCannotBeEmptyAsync() {
        let message: string = await this.translate.get('SnackBarMessages.NoteTitleCannotBeEmpty').toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();
        this.showActionSnackBar(message, action);
    }

    public async closeNoteBeforeChangingCollections() {
        let message: string = await this.translate.get('SnackBarMessages.CloseNoteBeforeChangingCollections').toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();
        this.showActionSnackBar(message, action);
    }

    public async noteExportedAsync(noteTitle: string) {
        let message: string = await this.translate.get('SnackBarMessages.NoteExported', { noteTitle: noteTitle }).toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();
        this.showActionSnackBar(message, action);
    }

    public async invalidNoteFileAsync() {
        let message: string = await this.translate.get('SnackBarMessages.InvalidNoteFile').toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();
        this.showActionSnackBar(message, action);
    }

    public async noteMovedToNotebook(notebookName: string) {
        let message: string = await this.translate.get('SnackBarMessages.noteMovedToNotebook', { notebookName: notebookName }).toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();
        this.showActionSnackBar(message, action);
    }

    private showActionLessSnackBar(message: string) {
        this.zone.run(() => {
            this.snackBar.open(message, '', { duration: this.calculateDuration(message) });
        });
    }

    private showActionSnackBar(message: string, action: string) {
        this.zone.run(() => {
            this.snackBar.open(message, action, { duration: this.calculateDuration(message) });
        });
    }

    private calculateDuration(message: string): number {
        // See: https://ux.stackexchange.com/questions/11203/how-long-should-a-temporary-notification-toast-appear
        // We assume a safe reading speed of 150 words per minute and an average of 5.8 characters per word in the English language.
        // Then, approx. 1 character is read every 70 milliseconds. Adding a margin of 5 milliseconds, gives us 75 ms.
        return Math.min(Math.max(message.length * 75, 2000), 7000);
    }
}