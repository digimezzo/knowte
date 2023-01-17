import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as remote from '@electron/remote';
import { OpenDialogReturnValue } from 'electron';
import { Logger } from '../../core/logger';
import { ProductInformation } from '../../core/product-information';
import { AppearanceService } from '../../services/appearance/appearance.service';
import { CollectionService } from '../../services/collection/collection.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
@Component({
    selector: 'app-welcome-page',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class WelcomeComponent implements OnInit {
    constructor(
        private translator: TranslatorService,
        private collectionService: CollectionService,
        public appearance: AppearanceService,
        private dialog: MatDialog,
        private zone: NgZone,
        public router: Router,
        private logger: Logger
    ) {}

    public applicationName: string = ProductInformation.applicationName.toUpperCase();
    public isBusy: boolean = false;

    public ngOnInit(): void {}

    public async openDirectoryChooserAsync(): Promise<void> {
        this.logger.info('Opening directory chooser', 'WelcomeComponent', 'openDirectoryChooserAsync');

        const selectFolderText: string = await this.translator.getAsync('DialogTitles.SelectFolder');

        const openDialogReturnValue: OpenDialogReturnValue = await remote.dialog.showOpenDialog({
            title: selectFolderText,
            properties: ['openDirectory'],
        });

        if (
            openDialogReturnValue == undefined ||
            openDialogReturnValue.filePaths == undefined ||
            openDialogReturnValue.filePaths.length === 0
        ) {
            this.logger.warn('No folder was selected', 'WelcomeComponent', 'openDirectoryChooserAsync');
            return;
        }

        const selectedParentDirectory: string = openDialogReturnValue.filePaths[0];
        this.logger.info(`Selected directory: '${selectedParentDirectory}'`, 'WelcomeComponent', 'openDirectoryChooserAsync');

        this.zone.run(async () => {
            this.isBusy = true;

            if (!(await this.collectionService.setStorageDirectoryAsync(selectedParentDirectory))) {
                const errorText: string = await this.translator.getAsync('ErrorTexts.StorageDirectoryCreationError', {
                    storageDirectory: selectedParentDirectory,
                });
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px',
                    data: { errorText: errorText },
                });
            }

            await this.collectionService.initializeAsync();

            this.isBusy = false;

            this.router.navigate(['/collection']);
        });
    }
}
