import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'error-dialog',
    templateUrl: './errorDialog.component.html',
    styleUrls: ['./errorDialog.component.scss']
})
export class ErrorDialogComponent implements OnInit {
    constructor() {

    }

    public ErrorText: string;

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
