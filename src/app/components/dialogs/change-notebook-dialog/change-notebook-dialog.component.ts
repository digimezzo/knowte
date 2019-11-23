import { Component, OnInit, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Notebook } from '../../../data/entities/notebook';
import { remote } from 'electron';
import { Constants } from '../../../core/constants';

@Component({
    selector: 'app-change-notebook-dialog',
    templateUrl: './change-notebook-dialog.component.html',
    styleUrls: ['./change-notebook-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChangeNotebookDialogComponent implements OnInit, OnDestroy {
    private globalEmitter = remote.getGlobal('globalEmitter');

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ChangeNotebookDialogComponent>) {
    }

    public notebooks: Notebook[];

    public ngOnDestroy(): void {
    }

    public async ngOnInit(): Promise<void> {
        this.globalEmitter.emit(Constants.getNotebooksEvent, this.getNotebooksCallback.bind(this));
    }

    public changeNotebook(notebook: Notebook) {
        this.globalEmitter.emit(Constants.setNotebookEvent, notebook.id, [this.data.noteId]);
        this.dialogRef.close(true); // Force return "true"
    }

    private getNotebooksCallback(notebooks: Notebook[]): void {
        this.notebooks = notebooks;
    }
}