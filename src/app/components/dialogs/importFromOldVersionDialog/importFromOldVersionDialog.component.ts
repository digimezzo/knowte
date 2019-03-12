import { Component, OnInit } from '@angular/core';
import { remote } from 'electron';
import log from 'electron-log';
import { Utils } from '../../../core/utils';

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
    public isBusy: boolean = false;
    public isImportFinished: boolean = false;
    public isImportSuccessful: boolean = true;

    ngOnInit() {
    }

    public selectDirectory(): void {
        let selectedDirectories: string[] = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

        if (selectedDirectories && selectedDirectories.length > 0) {
            this.selectedDirectory = selectedDirectories[0];
            this.isDirectoryChosen = true;
        }
    }

    public async startImport(): Promise<void> {
        this.isBusy = true;

        await Utils.sleep(2000);

        this.isBusy = false;
        this.isImportFinished = true;
    }
}
