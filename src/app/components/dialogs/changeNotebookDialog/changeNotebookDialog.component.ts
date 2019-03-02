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

    ngOnDestroy() {
    }

    async ngOnInit() {
        this.globalEmitter.emit(Constants.getNotebooksEvent, this.data.noteId, this.getNotebooksCallback.bind(this));
    }

    private getNotebooksCallback(notebooks: Notebook[]): void {
        this.notebooks = notebooks;
    }

    public changeNotebook(notebook: Notebook) {
        this.globalEmitter.emit(Constants.setNotebookEvent, this.data.noteId, notebook.id);
        this.dialogRef.close(true); // Force return "true"
    }
}