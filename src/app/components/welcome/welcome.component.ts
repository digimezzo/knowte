import { Component, OnInit, NgZone, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { remote } from 'electron';
import log from 'electron-log';
import { Constants } from '../../core/constants';
import { CollectionService } from '../../services/collection.service';
import { MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';
import { Router } from '@angular/router';

@Component({
    selector: 'welcome-page',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WelcomeComponent implements OnInit {
    constructor(private translate: TranslateService, private collectionService: CollectionService, private dialog: MatDialog, private zone: NgZone,
        public router: Router) {
    }

    public applicationName: string = Constants.applicationName.toUpperCase();
    public isBusy: boolean = false;

    ngOnInit() {
    }

    public async openDirectoryChooserAsync(): Promise<void> {
        log.info("Opening directory chooser");

        let selectFolderText: string = await this.translate.get('DialogTitles.SelectFolder').toPromise();

        remote.dialog.showOpenDialog({ title: selectFolderText, properties: ['openDirectory'] }, (folderPath) => {
            if (folderPath === undefined) {
                log.warn("No folder was selected");
                return;
            }

            let selectedParentDirectory: string = folderPath[0];
            log.info(`Selected directory: '${selectedParentDirectory}'`);

            this.zone.run(async () => {
                this.isBusy = true;

                if (!await this.collectionService.setStorageDirectoryAsync(selectedParentDirectory)) {
                    let errorText: string = await this.translate.get('ErrorTexts.StorageDirectoryCreationError', {storageDirectory: selectedParentDirectory}).toPromise();
                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px', data: { errorText: errorText }
                    });
                }

                await this.collectionService.initializeAsync();

                this.isBusy = false;

                this.router.navigate(['/collection']);
            });
        });
    }
}
