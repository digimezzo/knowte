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

    public collectionAdded(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.CollectionAdded', {collectionName: collectionName});
        this.showActionLessSnackBar(message, 2000);
    }

    public collectionActivated(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.CollectionActivated', {collectionName: collectionName});
        this.showActionLessSnackBar(message, 2000);
    }

    public collectionRenamed(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.CollectionRenamed', {collectionName: collectionName});
        this.showActionLessSnackBar(message, 2000);
    }

    public collectionDeleted(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.CollectionDeleted', {collectionName: collectionName});
        this.showActionLessSnackBar(message, 2000);
    }

    public duplicateCollection(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.DuplicateCollection', {collectionName: collectionName});
        this.showActionLessSnackBar(message, 2000);
    }

    public duplicateNotebook(notebookName: string) {
        let message: string = this.translate.instant('SnackBarMessages.DuplicateNotebook', {notebookName: notebookName});
        this.showActionLessSnackBar(message, 2000);
    }

    public notebookAdded(notebookName: string) {
        let message: string = this.translate.instant('SnackBarMessages.NotebookAdded', {notebookName: notebookName});
        this.showActionLessSnackBar(message, 2000);
    }

    public notebookDeleted(notebookName: string) {
        let message: string = this.translate.instant('SnackBarMessages.NotebookDeleted', {notebookName: notebookName});
        this.showActionLessSnackBar(message, 2000);
    }

    public notebookRenamed(notebookName: string) {
        let message: string = this.translate.instant('SnackBarMessages.NotebookRenamed', {notebookName: notebookName});
        this.showActionLessSnackBar(message, 2000);
    }
}