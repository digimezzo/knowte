import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../../services/collection/collection.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogComponent } from '../errorDialog/errorDialog.component';
import { Operation } from '../../../core/enums';
import { SnackBarService } from '../../../services/snackBar/snackBar.service';

@Component({
    selector: 'rename-collection-dialog',
    templateUrl: './renameCollectionDialog.component.html',
    styleUrls: ['./renameCollectionDialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RenameCollectionDialogComponent implements OnInit {
    constructor(private collection: CollectionService, private dialogRef: MatDialogRef<RenameCollectionDialogComponent>,
        private translate: TranslateService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog,
        private snackBar: SnackBarService) {
        dialogRef.disableClose = true;
    }

    public oldCollection: string = this.data.oldCollection;
    public newCollection: string = this.data.oldCollection;

    public ngOnInit(): void {
    }

    public async renameCollectionAsync(): Promise<void> {
        let operation: Operation = await this.collection.renameCollectionAsync(this.oldCollection, this.newCollection);

        if (operation === Operation.Error) {
            let errorText: string = (await this.translate.get('ErrorTexts.RenameCollectionError', { collection: this.newCollection }).toPromise());

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
