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

    public confirmationInputText: string = '';
    public errorText: string = '';

    public get canCloseDialog(): boolean {
        if (!this.data.requiresConfirmation) {
            if (this.data.inputText) {
                return true;
            }
        }

        if (this.data.inputText && this.confirmationInputText && this.data.inputText === this.confirmationInputText) {
            return true;
        }

        return false;
    }

    public get hasConfirmationError(): boolean {
        if (this.data.inputText !== this.confirmationInputText) {
            return true;
        }

        return false;
    }

    public ngOnInit(): void {}

    public closeDialog(): void {
        if (this.canCloseDialog) {
            this.dialogRef.close(true); // Force return "true"}
        }
    }
}
