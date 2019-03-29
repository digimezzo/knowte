import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { remote } from 'electron';
import { CollectionService } from '../../../services/collection.service';

@Component({
    selector: 'importfromoldversion-dialog',
    templateUrl: './importFromOldVersionDialog.component.html',
    styleUrls: ['./importFromOldVersionDialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ImportFromOldVersionDialogComponent implements OnInit {
    constructor(private collectionService: CollectionService) {
    }

    public isDirectoryChosen: boolean = false;
    public selectedDirectory: string = "";
    public isBusy: boolean = false;
    public isImportFinished: boolean = false;
    public isImportSuccessful: boolean = true;

    public ngOnInit(): void {
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

        this.isImportSuccessful = await this.collectionService.importFromOldVersionAsync(this.selectedDirectory);

        this.isBusy = false;
        this.isImportFinished = true;
    }

    public viewLog(): void {
        // See: https://stackoverflow.com/questions/30381450/open-external-file-with-electron
        remote.shell.openItem(remote.app.getPath("userData"));
    }
}
