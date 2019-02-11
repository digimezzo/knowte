import { Injectable, NgZone } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatSnackBar } from "@angular/material";

@Injectable({
    providedIn: 'root',
})
export class SnackBarService {
    constructor(private zone: NgZone, private translate: TranslateService, private snackBar: MatSnackBar) {
    }

    private showActionLessSnackBar(message: string, durationMillis: number) {
        this.zone.run(() => {
            this.snackBar.open(message, '', { duration: durationMillis });
        });
    }

    public async collectionActivatedAsync(collectionName: string) {
        let message: string = await this.translate.get('SnackBarMessages.CollectionActivated', { collectionName: collectionName }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async duplicateCollectionAsync(collectionName: string) {
        let message: string = await this.translate.get('SnackBarMessages.DuplicateCollection', { collectionName: collectionName }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async duplicateNotebookAsync(notebookName: string) {
        let message: string = await this.translate.get('SnackBarMessages.DuplicateNotebook', { notebookName: notebookName }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async noteDeleteBlockedAsync(noteTitle: string) {
        let message: string = await this.translate.get('SnackBarMessages.NoteDeleteBlocked', { noteTitle: noteTitle }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async noteAlreadyOpenAsync() {
        let message: string = await this.translate.get('SnackBarMessages.NoteAlreadyOpen').toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async noteTitleCannotBeEmptyAsync() {
        let message: string = await this.translate.get('SnackBarMessages.NoteTitleCannotBeEmpty').toPromise();
        this.showActionLessSnackBar(message, 2000);
    }
}