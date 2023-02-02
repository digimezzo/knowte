import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CollectionService } from '../../../../services/collection/collection.service';
import { SnackBarService } from '../../../../services/snack-bar/snack-bar.service';
import { TranslatorService } from '../../../../services/translator/translator.service';
import { ConfirmationDialogComponent } from '../../../dialogs/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '../../../dialogs/error-dialog/error-dialog.component';

@Component({
    selector: 'app-move-notes-bottom-sheet',
    templateUrl: 'move-notes-bottom-sheet.component.html',
    styleUrls: ['./move-notes-bottom-sheet.component.scss'],
})
export class MoveNotesBottomSheetComponent implements OnInit {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
        private dialog: MatDialog,
        private bottomSheetRef: MatBottomSheetRef<MoveNotesBottomSheetComponent>,
        private collectionService: CollectionService,
        private translatorService: TranslatorService,
        private snackBarService: SnackBarService
    ) {}

    public collections: string[];
    public activeCollection: string = '';

    public async ngOnInit(): Promise<void> {
        await this.getCollectionsAsync();
    }

    public async moveNotesToCollectionAsync(collection: string): Promise<void> {
        this.bottomSheetRef.dismiss();

        if (collection === this.activeCollection) {
            return;
        }

        let title: string = await this.translatorService.getAsync('DialogTitles.ConfirmMoveNote');
        let text: string = await this.translatorService.getAsync('DialogTexts.ConfirmMoveNote', { collection: collection });

        if (this.data.selectedNoteIds.length > 1) {
            title = await this.translatorService.getAsync('DialogTitles.ConfirmMoveNotes');
            text = await this.translatorService.getAsync('DialogTexts.ConfirmMoveNotes', { collection: collection });
        }

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: { dialogTitle: title, dialogText: text },
        });

        const result: any = await dialogRef.afterClosed().toPromise();

        if (result) {
            const numberOfNotes: number = await this.collectionService.moveNotesToCollectionAsync(this.data.selectedNoteIds, collection);

            if (numberOfNotes > 0) {
                await this.snackBarService.notesMoveToCollectionAsync(numberOfNotes, collection);
            } else {
                const errorText: string = await this.translatorService.getAsync('ErrorTexts.MoveNotesError', {
                    collection: collection,
                });

                this.dialog.open(ErrorDialogComponent, {
                    width: '450px',
                    data: { errorText: errorText },
                });
            }
        }
    }

    private async getCollectionsAsync(): Promise<void> {
        this.collections = await this.collectionService.getCollectionsAsync();
        this.activeCollection = this.collectionService.getActiveCollection();
    }
}
