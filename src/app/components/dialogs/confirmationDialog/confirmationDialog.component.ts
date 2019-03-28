import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { remote } from 'electron';

@Component({
    selector: 'confirmation-dialog',
    templateUrl: './confirmationDialog.component.html',
    styleUrls: ['./confirmationDialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ConfirmationDialogComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
        dialogRef.disableClose = true;
    }

    ngOnInit() {
    }
}
