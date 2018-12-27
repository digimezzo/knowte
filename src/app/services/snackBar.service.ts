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
        let message: string = this.translate.instant('SnackBarMessages.CollectionAdded').replace("{collectionName}", `"${collectionName}"`);
        this.showActionLessSnackBar(message, 2000);
    }

    public collectionActivated(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.CollectionActivated').replace("{collectionName}", `"${collectionName}"`);
        this.showActionLessSnackBar(message, 2000);
    }

    public collectionRenamed(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.CollectionRenamed').replace("{collectionName}", `"${collectionName}"`);
        this.showActionLessSnackBar(message, 2000);
    }

    public collectionDeleted(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.CollectionDeleted').replace("{collectionName}", `"${collectionName}"`);
        this.showActionLessSnackBar(message, 2000);
    }

    public duplicateCollection(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.DuplicateCollection').replace("{collectionName}", `"${collectionName}"`);
        this.showActionLessSnackBar(message, 2000);
    }

    public duplicateNotebook(notebookName: string) {
        let message: string = this.translate.instant('SnackBarMessages.DuplicateNotebook').replace("{notebookName}", `"${notebookName}"`);
        this.showActionLessSnackBar(message, 2000);
    }

    public notebookAdded(notebookName: string) {
        let message: string = this.translate.instant('SnackBarMessages.NotebookAdded').replace("{notebookName}", `"${notebookName}"`);
        this.showActionLessSnackBar(message, 2000);
    }

    public notebookDeleted(notebookName: string) {
        let message: string = this.translate.instant('SnackBarMessages.NotebookDeleted').replace("{notebookName}", `"${notebookName}"`);
        this.showActionLessSnackBar(message, 2000);
    }

    public notebookRenamed(notebookName: string) {
        let message: string = this.translate.instant('SnackBarMessages.NotebookRenamed').replace("{notebookName}", `"${notebookName}"`);
        this.showActionLessSnackBar(message, 2000);
    }
}