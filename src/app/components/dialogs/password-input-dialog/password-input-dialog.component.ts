import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-password-input-dialog',
    templateUrl: './password-input-dialog.component.html',
    styleUrls: ['./password-input-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class PasswordInputDialogComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<PasswordInputDialogComponent>) {
        dialogRef.disableClose = true;
    }

    public isHidden: boolean = true;

    public ngOnInit(): void {}

    public closeDialog(): void {
        if (this.data.inputText) {
            this.dialogRef.close(true); // Force return "true"
        }
    }
}
