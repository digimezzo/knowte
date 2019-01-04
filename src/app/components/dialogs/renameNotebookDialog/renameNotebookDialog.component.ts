import { Component, OnInit, Inject } from '@angular/core';
import { CollectionService } from '../../../services/collection.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'rename-notebook-dialog',
    templateUrl: './renameNotebookDialog.component.html',
    styleUrls: ['./renameNotebookDialog.component.scss']
})
export class RenameNotebookDialogComponent implements OnInit {
    constructor(private collectionService: CollectionService, private dialogRef: MatDialogRef<RenameNotebookDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    public notebookId: string = this.data.notebookId;
    public notebookName: string = this.collectionService.getNotebookName(this.data.notebookId);

    public async renameNotebookAsync(): Promise<void> {
        await this.collectionService.renameNotebookAsync(this.notebookId, this.notebookName);
    }

    public async renameNotebookAndCloseAsync(): Promise<void> {
        await this.renameNotebookAsync();
        this.dialogRef.close();
    }

    ngOnInit() {
    }
}
