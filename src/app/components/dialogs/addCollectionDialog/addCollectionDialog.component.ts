import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'add-collection-dialog',
    templateUrl: './addCollectionDialog.component.html',
    styleUrls: ['./addCollectionDialog.component.scss']
})
export class AddCollectionDialogComponent implements OnInit {
    constructor() {

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
