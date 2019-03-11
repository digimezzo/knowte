import { Component, OnInit } from '@angular/core';
import { remote } from 'electron';
import log from 'electron-log';

@Component({
    selector: 'importfromoldversion-dialog',
    templateUrl: './importFromOldVersionDialog.component.html',
    styleUrls: ['./importFromOldVersionDialog.component.scss']
})
export class ImportFromOldVersionDialogComponent implements OnInit {
    constructor() {
    }

    public isDirectoryChosen: boolean = false;
    public selectedDirectory: string = "";

    ngOnInit() {
    }

    public selectDirectory(): void {
        let selectedDirectories: string[] = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

        if (selectedDirectories && selectedDirectories.length > 0) {
            this.selectedDirectory = selectedDirectories[0];
            this.isDirectoryChosen = true;
        }
    }

    public startImport(): void {

    }
}
