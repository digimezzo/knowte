import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'license-dialog',
    templateUrl: './licenseDialog.component.html',
    styleUrls: ['./licenseDialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LicenseDialogComponent implements OnInit {
    constructor(private dialogRef: MatDialogRef<LicenseDialogComponent>) {
        dialogRef.disableClose = true;
    }

    public ngOnInit(): void {
    }
}
