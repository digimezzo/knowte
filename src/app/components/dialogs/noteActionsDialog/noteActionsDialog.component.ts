import { Component, OnInit, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { remote } from 'electron';
import { NoteAction } from './noteAction';

@Component({
    selector: 'noteactions-dialog',
    templateUrl: './noteActionsDialog.component.html',
    styleUrls: ['./noteActionsDialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteActionsDialogComponent implements OnInit, OnDestroy {
    private globalEmitter = remote.getGlobal('globalEmitter');

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<NoteActionsDialogComponent>) {
    }

    public selectedNoteAction: NoteAction;
    public isMarked: boolean;

    public ngOnDestroy(): void {
    }

    public async ngOnInit(): Promise<void> {
        this.isMarked = this.data.isMarked;
    }

    public closeDialog(): void {
        this.dialogRef.close(true); // Force return "true"
    }

    public setNoteActionToggleMark(): void {
        this.selectedNoteAction = NoteAction.ToggleMark;
        this.closeDialog();
    }

    public setNoteActionExport(): void {
        this.selectedNoteAction = NoteAction.Export;
        this.closeDialog();
    }

    public setNoteActionExportToPdf(): void {
        this.selectedNoteAction = NoteAction.ExportToPdf;
        this.closeDialog();
    }

    public setNoteActionPrint(): void {
        this.selectedNoteAction = NoteAction.Print;
        this.closeDialog();
    }

    public setNoteActionDelete(): void {
        this.selectedNoteAction = NoteAction.Delete;
        this.closeDialog();
    }
}