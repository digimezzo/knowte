import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Operation } from '../../../../core/enums';
import { CollectionService } from '../../../../services/collection/collection.service';
import { TranslatorService } from '../../../../services/translator/translator.service';
import { ConfirmationDialogComponent } from '../../../dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-transfer-notes-bottom-sheet',
    templateUrl: 'transfer-notes-bottom-sheet.component.html',
    styleUrls: ['./transfer-notes-bottom-sheet.component.scss'],
})
export class TransferNotesBottomSheetComponent implements OnInit {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
        private dialog: MatDialog,
        private bottomSheetRef: MatBottomSheetRef<TransferNotesBottomSheetComponent>,
        private collectionService: CollectionService,
        private translatorService: TranslatorService
    ) {}

    public collections: string[];
    public activeCollection: string = '';

    public async ngOnInit(): Promise<void> {
        await this.getCollectionsAsync();
    }

    public async transferNotesToCollectionAsync(collection: string): Promise<void> {
        this.bottomSheetRef.dismiss();

        let title: string = await this.translatorService.getAsync('DialogTitles.ConfirmTransferNote');
        let text: string = await this.translatorService.getAsync('DialogTexts.ConfirmTransferNote', { collection: collection });

        if (this.data.selectedNoteIds.length > 1) {
            title = await this.translatorService.getAsync('DialogTitles.ConfirmTransferNotes');
            text = await this.translatorService.getAsync('DialogTexts.ConfirmTransferNotes', { collection: collection });
        }

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: { dialogTitle: title, dialogText: text },
        });

        const result: any = await dialogRef.afterClosed().toPromise();

        if (result) {
            const operation: Operation = await this.collectionService.transferNotesToCollectionAsync(this.data.selectedNoteIds, collection);

            if (operation === Operation.Success) {
                // TODO: notify the user of success via snackbar
                alert('TRANSFER SUCCESS!');
            } else {
                // TODO: notify the user via error popup
                alert('TRANSFER FAILED!');
            }
        }
    }

    private async getCollectionsAsync(): Promise<void> {
        this.collections = await this.collectionService.getCollectionsAsync();
        this.activeCollection = this.collectionService.getActiveCollection();
    }
}
