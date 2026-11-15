import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InputData } from './input-data';

@Component({
    selector: 'app-input-dialog',
    templateUrl: './input-dialog.component.html',
    styleUrls: ['./input-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class InputDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: InputData, private dialogRef: MatDialogRef<InputDialogComponent>) {
        dialogRef.disableClose = true;
    }

    public closeDialog(): void {
        if (this.data.inputText || this.data.allowEmpty) {
            this.dialogRef.close(true); // Force return "true"
        }
    }
}
