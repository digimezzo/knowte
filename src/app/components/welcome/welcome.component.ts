import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { remote } from 'electron';
import log from 'electron-log';
import { Constants } from '../../core/constants';
import { CollectionService } from '../../services/collection.service';
import { MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';

@Component({
    selector: 'welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

    constructor(private translate: TranslateService, private collectionService: CollectionService, private dialog: MatDialog) {
        log.info("Showing welcome screen");
    }

    public applicationName: string = Constants.applicationName.toUpperCase();

    ngOnInit() {
    }

    public openDirectoryChooser(): void {
        log.info("Opening directory chooser");

        remote.dialog.showOpenDialog({ title: this.translate.instant('DialogTitles.SelectFolder'), properties: ['openDirectory'] }, (folderPath) => {
            if (folderPath === undefined) {
                log.warn("No folder was selected");
                return;
            }

            log.info(`Selected directory: '${folderPath[0]}'`);

            if (!this.collectionService.initializeStorageDirectory(folderPath[0])) {
                const dialogRef = this.dialog.open(ErrorDialogComponent, {
                    width: '450px'
                  });
            }
        });
    }
}
