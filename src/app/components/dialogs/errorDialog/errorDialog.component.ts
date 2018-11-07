import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'error-dialog',
    templateUrl: './errorDialog.component.html',
    styleUrls: ['./errorDialog.component.scss']
})
export class ErrorDialogComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
    }

    public onViewLogClick(): void {
        // TODO
        // See: https://stackoverflow.com/questions/30381450/open-external-file-with-electron
        const { shell } = require('electron');
        // Open a local file in the default app
        shell.openItem('c:\\example.txt');

        // Open a URL in the default way
        shell.openExternal('https://github.com');
    }
}
