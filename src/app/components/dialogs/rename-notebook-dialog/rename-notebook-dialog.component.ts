import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Operation } from '../../../common/enums/operation';
import { CollectionService } from '../../../services/collection/collection.service';
import { SnackBarService } from '../../../services/snack-bar/snack-bar.service';
import { TranslatorService } from '../../../services/translator/translator.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
    selector: 'app-rename-notebook-dialog',
    templateUrl: './rename-notebook-dialog.component.html',
    styleUrls: ['./rename-notebook-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class RenameNotebookDialogComponent implements OnInit {
    constructor(
        private collectionService: CollectionService,
        private dialogRef: MatDialogRef<RenameNotebookDialogComponent>,
        private translator: TranslatorService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialog: MatDialog,
        private snackBar: SnackBarService
    ) {
        dialogRef.disableClose = true;
    }

    public notebookId: string = this.data.notebookId;
    public notebookName: string = this.collectionService.getNotebookName(this.data.notebookId);

    public ngOnInit(): void {}

    public async renameNotebookAsync(): Promise<void> {
        const operation: Operation = await this.collectionService.renameNotebookAsync(this.notebookId, this.notebookName);

        if (operation === Operation.Error) {
            const errorText: string = await this.translator.getAsync('ErrorTexts.RenameNotebookError', { notebookName: this.notebookName });

            this.dialog.open(ErrorDialogComponent, {
                width: '450px',
                data: { errorText: errorText },
            });
        } else if (operation === Operation.Duplicate) {
            this.snackBar.duplicateNotebookAsync(this.notebookName);
        }
    }

    public async renameNotebookAndCloseAsync(): Promise<void> {
        await this.renameNotebookAsync();
        this.dialogRef.close();
    }
}
