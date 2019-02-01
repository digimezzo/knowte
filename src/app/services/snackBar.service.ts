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

    public async collectionAddedAsync(collectionName: string) {
        let message: string = await this.translate.get('SnackBarMessages.CollectionAdded', { collectionName: collectionName }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async collectionActivatedAsync(collectionName: string) {
        let message: string = await this.translate.get('SnackBarMessages.CollectionActivated', { collectionName: collectionName }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async collectionRenamedAsync(collectionName: string) {
        let message: string = await this.translate.get('SnackBarMessages.CollectionRenamed', { collectionName: collectionName }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async collectionDeletedAsync(collectionName: string) {
        let message: string = await this.translate.get('SnackBarMessages.CollectionDeleted', { collectionName: collectionName }).toPromise();
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

    public async notebookAddedAsync(notebookName: string) {
        let message: string = await this.translate.get('SnackBarMessages.NotebookAdded', { notebookName: notebookName }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async notebookDeletedAsync(notebookName: string) {
        let message: string = await this.translate.get('SnackBarMessages.NotebookDeleted', { notebookName: notebookName }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async notebookRenamedAsync(notebookName: string) {
        let message: string = await this.translate.get('SnackBarMessages.NotebookRenamed', { notebookName: notebookName }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async noteAddedAsync(noteTitle: string) {
        let message: string = await this.translate.get('SnackBarMessages.NoteAdded', { noteTitle: noteTitle }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async noteDeletedAsync(noteTitle: string) {
        let message: string = await this.translate.get('SnackBarMessages.NoteDeleted', { noteTitle: noteTitle }).toPromise();
        this.showActionLessSnackBar(message, 2000);
    }

    public async noteAlreadyOpenAsync() {
        let message: string = await this.translate.get('SnackBarMessages.NoteAlreadyOpen').toPromise();
        this.showActionLessSnackBar(message, 2000);
    }
}