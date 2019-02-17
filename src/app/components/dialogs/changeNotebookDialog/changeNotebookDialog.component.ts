import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Notebook } from '../../../data/entities/notebook';
import { CollectionService } from '../../../services/collection.service';
import { NoteService } from '../../../services/note.service';

@Component({
    selector: 'changenotebook-dialog',
    templateUrl: './changeNotebookDialog.component.html',
    styleUrls: ['./changeNotebookDialog.component.scss']
})
export class ChangeNotebookDialogComponent implements OnInit, OnDestroy {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private collectionService: CollectionService, private noteService: NoteService,
        private dialogRef: MatDialogRef<ChangeNotebookDialogComponent>) {
    }

    public notebooks: Notebook[];

    ngOnDestroy() {
    }

    async ngOnInit() {
        await this.getNotebooksAsync();
    }

    private async getNotebooksAsync(): Promise<void> {
        this.notebooks = await this.collectionService.getNotebooksAsync(false);
    }

    public changeNotebook(notebook: Notebook) {
        this.noteService.setNotebook(this.data.noteId, notebook.id);
        this.dialogRef.close(true); // Force return "true"
    }
}
