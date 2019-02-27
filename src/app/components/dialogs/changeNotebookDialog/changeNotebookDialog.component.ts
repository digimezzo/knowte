import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Notebook } from '../../../data/entities/notebook';
import { EventService } from '../../../services/event.service';
import * as nanoid from 'nanoid';
import log from 'electron-log';

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
    public requestId: string = nanoid();

    ngOnDestroy() {
    }

    async ngOnInit() {
        this.eventService.sendNotebooksEvent.receive(this.requestId, this.populateNotebooks.bind(this));
        this.eventService.requestNotebooksEvent.send(this.requestId);
    }

    private populateNotebooks(notebooks: Notebook[]): void {
        this.notebooks = notebooks;
    }

    public changeNotebook(notebook: Notebook) {
        // this.noteService.setNotebook(this.data.noteId, notebook.id);
        this.dialogRef.close(true); // Force return "true"
    }
}