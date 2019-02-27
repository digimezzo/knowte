import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Notebook } from '../../../data/entities/notebook';
import * as nanoid from 'nanoid';
import log from 'electron-log';
import { remote } from 'electron';
import { Constants } from '../../../core/constants';

@Component({
    selector: 'changenotebook-dialog',
    templateUrl: './changeNotebookDialog.component.html',
    styleUrls: ['./changeNotebookDialog.component.scss']
})
export class ChangeNotebookDialogComponent implements OnInit, OnDestroy {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ChangeNotebookDialogComponent>) {
    }

    private globalEmitter = remote.getGlobal('globalEmitter');
    public notebooks: Notebook[];
    public notebooksRequestId: string = nanoid();

    private populateNotebooksListener: any = this.populateNotebooks.bind(this);

    ngOnDestroy() {
        this.globalEmitter.removeListener(this.notebooksRequestId, this.populateNotebooksListener);
    }

    async ngOnInit() {
        this.globalEmitter.on(this.notebooksRequestId, this.populateNotebooksListener);
        this.globalEmitter.emit(Constants.requestNotebooksEvent, this.notebooksRequestId);
    }

    private populateNotebooks(notebooks: Notebook[]): void {
        this.notebooks = notebooks;
    }

    public changeNotebook(notebook: Notebook) {
        this.globalEmitter.emit(Constants.setNotebookEvent, this.data.noteId, notebook.id);
        this.dialogRef.close(true); // Force return "true"
    }
}