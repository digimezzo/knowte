import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Operation } from '../../../common/enums/operation';
import { CollectionService } from '../../../services/collection/collection.service';
import { SnackBarService } from '../../../services/snack-bar/snack-bar.service';
import { TranslatorService } from '../../../services/translator/translator.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { ErrorData } from '../error-dialog/error-data';
import { RenameCollectionData } from './rename-collection-data';

@Component({
    selector: 'app-rename-collection-dialog',
    templateUrl: './rename-collection-dialog.component.html',
    styleUrls: ['./rename-collection-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class RenameCollectionDialogComponent {
    constructor(
        private collectionService: CollectionService,
        private dialogRef: MatDialogRef<RenameCollectionDialogComponent>,
        private translator: TranslatorService,
        @Inject(MAT_DIALOG_DATA) public data: RenameCollectionData,
        private dialog: MatDialog,
        private snackBar: SnackBarService
    ) {
        dialogRef.disableClose = true;
    }

    public oldCollection: string = this.data.oldCollection;
    public newCollection: string = ''; // Will be filled in by dialog input

    public async renameCollectionAsync(): Promise<void> {
        const operation: Operation = await this.collectionService.renameCollectionAsync(this.oldCollection, this.newCollection);

        if (operation === Operation.Error) {
            const errorText: string = await this.translator.getAsync('ErrorTexts.RenameCollectionError', {
                collection: this.oldCollection,
            });

            this.dialog.open(ErrorDialogComponent, {
                width: '450px',
                data: new ErrorData(errorText),
            });
        } else if (operation === Operation.Duplicate) {
            this.snackBar.duplicateCollectionAsync(this.newCollection);
        }
    }

    public async renameCollectionAndCloseAsync(): Promise<void> {
        await this.renameCollectionAsync();
        this.dialogRef.close();
    }
}
