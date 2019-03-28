import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { remote } from 'electron';

@Component({
    selector: 'error-dialog',
    templateUrl: './errorDialog.component.html',
    styleUrls: ['./errorDialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ErrorDialogComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ErrorDialogComponent>) {
        dialogRef.disableClose = true;
    }

    ngOnInit() {
    }

    public viewLog(): void {
        // See: https://stackoverflow.com/questions/30381450/open-external-file-with-electron
        remote.shell.openItem(remote.app.getPath("userData"));
    }
}
