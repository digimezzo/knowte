import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { remote, OpenDialogReturnValue } from 'electron';
import { CollectionService } from '../../../services/collection/collection.service';

@Component({
    selector: 'app-import-from-old-version-dialog.component',
    templateUrl: './import-from-old-version-dialog.component.html',
    styleUrls: ['./import-from-old-version-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ImportFromOldVersionDialogComponent implements OnInit {
    constructor(private collection: CollectionService) {
    }

    public isDirectoryChosen: boolean = false;
    public selectedDirectory: string = '';
    public isBusy: boolean = false;
    public isImportFinished: boolean = false;
    public isImportSuccessful: boolean = true;

    public ngOnInit(): void {
    }

    public async selectDirectoryAsync(): Promise<void> {
        const openDialoReturnValue: OpenDialogReturnValue = await remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

        if (openDialoReturnValue.filePaths && openDialoReturnValue.filePaths.length > 0) {
            this.selectedDirectory = openDialoReturnValue.filePaths[0];
            this.isDirectoryChosen = true;
        }
    }

    public async startImport(): Promise<void> {
        this.isBusy = true;

        this.isImportSuccessful = await this.collection.importFromOldVersionAsync(this.selectedDirectory);

        this.isBusy = false;
        this.isImportFinished = true;
    }

    public viewLog(): void {
        // See: https://stackoverflow.com/questions/30381450/open-external-file-with-electron
        remote.shell.openItem(remote.app.getPath('userData'));
    }
}
