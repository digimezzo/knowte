import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-license-dialog',
    templateUrl: './license-dialog.component.html',
    styleUrls: ['./license-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LicenseDialogComponent implements OnInit {
    constructor(private dialogRef: MatDialogRef<LicenseDialogComponent>) {
        dialogRef.disableClose = true;
    }

    public ngOnInit(): void {
    }
}
