import { Component, OnInit, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { remote } from 'electron';

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

   
    public ngOnDestroy(): void {
    }

    public async ngOnInit(): Promise<void> {
        
    }
}