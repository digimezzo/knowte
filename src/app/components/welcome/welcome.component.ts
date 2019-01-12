import { Component, OnInit, NgZone } from '@angular/core';
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
    styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
    constructor(private translate: TranslateService, private collectionService: CollectionService, private dialog: MatDialog, private zone: NgZone,
        public router: Router) {
    }

    public applicationName: string = Constants.applicationName.toUpperCase();
    public isBusy: boolean = false;

    ngOnInit() {
        log.info(`Welcome`);
    }

    public openDirectoryChooser(): void {
        log.info("Opening directory chooser");

        remote.dialog.showOpenDialog({ title: this.translate.instant('DialogTitles.SelectFolder'), properties: ['openDirectory'] }, (folderPath) => {
            if (folderPath === undefined) {
                log.warn("No folder was selected");
                return;
            }

            let selectedParentDirectory: string = folderPath[0];
            log.info(`Selected directory: '${selectedParentDirectory}'`);

            this.zone.run(async () => {
                this.isBusy = true;

                if (!await this.collectionService.initializeStorageDirectoryAsync(selectedParentDirectory)) {
                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px', data: { errorText: this.translate.instant('ErrorTexts.StorageDirectoryCreationError').replace("{storageDirectory}", `'${selectedParentDirectory}'`) }
                    });
                }

                await this.collectionService.initializeDataStoreAsync();

                this.isBusy = false;

                this.router.navigate(['/main']);
            });
        });
    }
}
