import { Component, OnInit, Inject } from '@angular/core';
import { CollectionService } from '../../../services/collection.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { NotebookOperation } from '../../../services/notebookOperation';
import { ErrorDialogComponent } from '../errorDialog/errorDialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'rename-notebook-dialog',
    templateUrl: './renameNotebookDialog.component.html',
    styleUrls: ['./renameNotebookDialog.component.scss']
})
export class RenameNotebookDialogComponent implements OnInit {
    constructor(private collectionService: CollectionService, private dialogRef: MatDialogRef<RenameNotebookDialogComponent>,
        private translateService: TranslateService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog) {
    }

    public notebookId: string = this.data.notebookId;
    public notebookName: string = this.collectionService.getNotebookName(this.data.notebookId);

    public async renameNotebookAsync(): Promise<void> {
        let operation: NotebookOperation = await this.collectionService.renameNotebookAsync(this.notebookId, this.notebookName);

        if(operation === NotebookOperation.Error){
            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.RenameNotebookError', { notebookName: this.notebookName }).toPromise());

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: generatedErrorText }
            });
        }
    }

    public async renameNotebookAndCloseAsync(): Promise<void> {
        await this.renameNotebookAsync();
        this.dialogRef.close();
    }

    ngOnInit() {
    }
}
