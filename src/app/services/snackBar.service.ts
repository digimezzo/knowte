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

    private showActionSnackBar(message: string, action: string, durationMillis: number) {
        this.zone.run(() => {
            this.snackBar.open(message, action, { duration: durationMillis });
        });
    }

    public async collectionAddedAsync(collectionName: string) {	
        let message: string = await this.translate.get('SnackBarMessages.CollectionAdded', { collectionName: collectionName }).toPromise();	
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();	
        this.showActionSnackBar(message, action, 2000);	
    }

    public async collectionDeletedAsync(collectionName: string) {	
        let message: string = await this.translate.get('SnackBarMessages.CollectionDeleted', { collectionName: collectionName }).toPromise();	
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();	
        this.showActionSnackBar(message, action, 2000);	
    }

    public async collectionRenamedAsync(collectionName: string) {	
        let message: string = await this.translate.get('SnackBarMessages.CollectionRenamed', { collectionName: collectionName }).toPromise();	
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();	
        this.showActionSnackBar(message, action, 2000);	
    }

    public async collectionActivatedAsync(collectionName: string) {
        let message: string = await this.translate.get('SnackBarMessages.CollectionActivated', { collectionName: collectionName }).toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();	
        this.showActionSnackBar(message, action, 2000);	
    }

    public async duplicateCollectionAsync(collectionName: string) {
        let message: string = await this.translate.get('SnackBarMessages.DuplicateCollection', { collectionName: collectionName }).toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();	
        this.showActionSnackBar(message, action, 2000);	
    }

    public async duplicateNotebookAsync(notebookName: string) {
        let message: string = await this.translate.get('SnackBarMessages.DuplicateNotebook', { notebookName: notebookName }).toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();	
        this.showActionSnackBar(message, action, 2000);	
    }

    public async noteDeleteBlockedAsync(noteTitle: string) {
        let message: string = await this.translate.get('SnackBarMessages.NoteDeleteBlocked', { noteTitle: noteTitle }).toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();	
        this.showActionSnackBar(message, action, 2000);	
    }

    public async noteAlreadyOpenAsync() {
        let message: string = await this.translate.get('SnackBarMessages.NoteAlreadyOpen').toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();	
        this.showActionSnackBar(message, action, 2000);	
    }

    public async noteTitleCannotBeEmptyAsync() {
        let message: string = await this.translate.get('SnackBarMessages.NoteTitleCannotBeEmpty').toPromise();
        let action: string = await this.translate.get('SnackBarActions.Ok').toPromise();	
        this.showActionSnackBar(message, action, 2000);	
    }
}