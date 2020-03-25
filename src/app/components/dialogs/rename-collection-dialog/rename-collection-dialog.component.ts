import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../../services/collection/collection.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { Operation } from '../../../core/enums';
import { SnackBarService } from '../../../services/snack-bar/snack-bar.service';
import { TranslatorService } from '../../../services/translator/translator.service';

@Component({
    selector: 'app-rename-collection-dialog',
    templateUrl: './rename-collection-dialog.component.html',
    styleUrls: ['./rename-collection-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RenameCollectionDialogComponent implements OnInit {
    constructor(private collection: CollectionService, private dialogRef: MatDialogRef<RenameCollectionDialogComponent>,
        private translator: TranslatorService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog,
        private snackBar: SnackBarService) {
        dialogRef.disableClose = true;
    }

    public oldCollection: string = this.data.oldCollection;
    public newCollection: string = this.data.oldCollection;

    public ngOnInit(): void {
    }

    public async renameCollectionAsync(): Promise<void> {
        const operation: Operation = await this.collection.renameCollectionAsync(this.oldCollection, this.newCollection);

        if (operation === Operation.Error) {
            const errorText: string = (
                await this.translator.getAsync('ErrorTexts.RenameCollectionError',
                { collection: this.newCollection }
                ));

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: errorText }
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
