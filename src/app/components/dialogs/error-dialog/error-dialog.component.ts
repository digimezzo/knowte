import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationPaths } from '../../../core/applicationPaths';
import { Desktop } from '../../../core/desktop';
@Component({
    selector: 'app-error-dialog',
    templateUrl: './error-dialog.component.html',
    styleUrls: ['./error-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ErrorDialogComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<ErrorDialogComponent>,
        private desktop: Desktop,
        private applicationPaths: ApplicationPaths
    ) {
        this.dialogRef.disableClose = true;
    }

    public ngOnInit(): void {}

    public viewLog(): void {
        // See: https://stackoverflow.com/questions/30381450/open-external-file-with-electron
        this.desktop.showInFolder(this.applicationPaths.logFilePath());
    }
}
