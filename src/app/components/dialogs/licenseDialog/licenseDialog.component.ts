import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'license-dialog',
    templateUrl: './licenseDialog.component.html',
    styleUrls: ['./licenseDialog.component.scss']
})
export class LicenseDialogComponent implements OnInit {

    constructor(private dialogRef: MatDialogRef<LicenseDialogComponent>) {
        dialogRef.disableClose = true;
    }

    ngOnInit() {
    }
}
