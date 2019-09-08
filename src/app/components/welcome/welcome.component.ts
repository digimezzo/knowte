import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { remote } from 'electron';
import { Constants } from '../../core/constants';
import { CollectionService } from '../../services/collection/collection.service';
import { MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';
import { Router } from '@angular/router';
import { Logger } from '../../core/logger';
import { TranslatorService } from '../../services/translator/translator.service';

@Component({
    selector: 'welcome-page',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WelcomeComponent implements OnInit {
    constructor(private translator: TranslatorService, private collection: CollectionService, private dialog: MatDialog, private zone: NgZone,
        public router: Router, private logger: Logger) {
    }

    public applicationName: string = Constants.applicationName.toUpperCase();
    public isBusy: boolean = false;

    public ngOnInit(): void {
    }

    public async openDirectoryChooserAsync(): Promise<void> {
        this.logger.info("Opening directory chooser", "WelcomeComponent", "openDirectoryChooserAsync");

        let selectFolderText: string = await this.translator.getAsync('DialogTitles.SelectFolder');

        remote.dialog.showOpenDialog({ title: selectFolderText, properties: ['openDirectory'] }, (folderPath) => {
            if (folderPath === undefined) {
                this.logger.warn("No folder was selected", "WelcomeComponent", "openDirectoryChooserAsync");
                return;
            }

            let selectedParentDirectory: string = folderPath[0];
            this.logger.info(`Selected directory: '${selectedParentDirectory}'`, "WelcomeComponent", "openDirectoryChooserAsync");

            this.zone.run(async () => {
                this.isBusy = true;

                if (!await this.collection.setStorageDirectoryAsync(selectedParentDirectory)) {
                    let errorText: string = await this.translator.getAsync('ErrorTexts.StorageDirectoryCreationError', { storageDirectory: selectedParentDirectory });
                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px', data: { errorText: errorText }
                    });
                }

                await this.collection.initializeAsync();

                this.isBusy = false;

                this.router.navigate(['/collection']);
            });
        });
    }
}
