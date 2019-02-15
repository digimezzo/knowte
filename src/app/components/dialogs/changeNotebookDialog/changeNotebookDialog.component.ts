import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Notebook } from '../../../data/entities/notebook';
import { CollectionService } from '../../../services/collection.service';
import { NoteService } from '../../../services/note.service';
// import { Subscription } from 'rxjs';

@Component({
    selector: 'changenotebook-dialog',
    templateUrl: './changeNotebookDialog.component.html',
    styleUrls: ['./changeNotebookDialog.component.scss']
})
export class ChangeNotebookDialogComponent implements OnInit, OnDestroy {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private collectionService: CollectionService, private noteService: NoteService,
        private dialogRef: MatDialogRef<ChangeNotebookDialogComponent>) {
    }

    // private subscription: Subscription;
    public notebooks: Notebook[];

    ngOnDestroy() {
        // this.subscription.unsubscribe();
    }

    async ngOnInit() {
        await this.getNotebooksAsync();

        // this.subscription = this.collectionService.notebookAdded$.subscribe(async () => await this.getNotebooksAsync());
        // this.subscription.add(this.collectionService.notebookRenamed$.subscribe(async () => await this.getNotebooksAsync()));
        // this.subscription.add(this.collectionService.notebookDeleted$.subscribe(async () => await this.getNotebooksAsync()));
    }

    private async getNotebooksAsync(): Promise<void> {
        this.notebooks = await this.collectionService.getNotebooksAsync(false);
    }

    public changeNotebook(notebook: Notebook) {
        this.noteService.setNotebook(this.data.noteId, notebook.id);
        this.dialogRef.close(true); // Force return "true"
    }
}
