import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Notebook } from '../../../data/entities/notebook';
import { EventService } from '../../../services/event.service';
import * as nanoid from 'nanoid';

@Component({
    selector: 'changenotebook-dialog',
    templateUrl: './changeNotebookDialog.component.html',
    styleUrls: ['./changeNotebookDialog.component.scss']
})
export class ChangeNotebookDialogComponent implements OnInit, OnDestroy {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private eventService: EventService,
        private dialogRef: MatDialogRef<ChangeNotebookDialogComponent>) {
    }

    public notebooks: Notebook[];
    public eventId: string = nanoid();

    ngOnDestroy() {
    }

    async ngOnInit() {
        // await this.getNotebooksAsync();
        this.eventService.requestNotebooksEvent.send(this.eventId);
    }

    private async getNotebooksAsync(): Promise<void> {
        // this.notebooks = await this.collectionService.getNotebooksAsync(false);
    }

    public changeNotebook(notebook: Notebook) {
        // this.noteService.setNotebook(this.data.noteId, notebook.id);
        this.dialogRef.close(true); // Force return "true"
    }
}