import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-input-dialog',
    templateUrl: './input-dialog.component.html',
    styleUrls: ['./input-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InputDialogComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<InputDialogComponent>) {
        dialogRef.disableClose = true;
    }

    public inputText: string;

    public ngOnInit(): void {
    }

    public closeDialog(): void {
        if (this.inputText) {
            this.dialogRef.close(true); // Force return "true"
        }
    }
}
