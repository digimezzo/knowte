import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-license-dialog',
    templateUrl: './license-dialog.component.html',
    styleUrls: ['./license-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class LicenseDialogComponent {
    constructor(private dialogRef: MatDialogRef<LicenseDialogComponent>) {
        dialogRef.disableClose = true;
    }
}
