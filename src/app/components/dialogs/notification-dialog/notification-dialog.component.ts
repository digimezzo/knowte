import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationData } from './notification-data';
@Component({
    selector: 'app-notification-dialog',
    templateUrl: './notification-dialog.component.html',
    styleUrls: ['./notification-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class NotificationDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: NotificationData, private dialogRef: MatDialogRef<NotificationDialogComponent>) {
        this.dialogRef.disableClose = true;
    }
}
