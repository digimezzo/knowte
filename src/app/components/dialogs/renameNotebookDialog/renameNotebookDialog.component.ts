import { Component, OnInit, Inject } from '@angular/core';
import { CollectionService } from '../../../services/collection.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../errorDialog/errorDialog.component';
import { TranslateService } from '@ngx-translate/core';
import { Operation } from '../../../core/enums';
import { SnackBarService } from '../../../services/snackBar.service';

@Component({
    selector: 'rename-notebook-dialog',
    templateUrl: './renameNotebookDialog.component.html',
    styleUrls: ['./renameNotebookDialog.component.scss']
})
export class RenameNotebookDialogComponent implements OnInit {
    constructor(private collectionService: CollectionService, private dialogRef: MatDialogRef<RenameNotebookDialogComponent>,
        private translateService: TranslateService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog,
        private snackBarService: SnackBarService) {
        dialogRef.disableClose = true;
    }

    public notebookId: string = this.data.notebookId;
    public notebookName: string = this.collectionService.getNotebookName(this.data.notebookId);

    public async renameNotebookAsync(): Promise<void> {
        let operation: Operation = await this.collectionService.renameNotebookAsync(this.notebookId, this.notebookName);

        if (operation === Operation.Error) {
            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.RenameNotebookError', { notebookName: this.notebookName }).toPromise());

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: generatedErrorText }
            });
        } else if (operation === Operation.Duplicate) {
            this.snackBarService.duplicateNotebookAsync(this.notebookName);
        }
    }

    public async renameNotebookAndCloseAsync(): Promise<void> {
        await this.renameNotebookAsync();
        this.dialogRef.close();
    }

    ngOnInit() {
    }
}
