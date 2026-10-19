import {Component, ViewEncapsulation} from '@angular/core';
import {BaseSettings} from "../../../common/settings/base-settings";
import {OpenDialogReturnValue} from "electron";
import * as remote from "@electron/remote";
import {ErrorDialogComponent} from "../../dialogs/error-dialog/error-dialog.component";
import {TranslatorService} from "../../../services/translator/translator.service";
import {CollectionService} from "../../../services/collection/collection.service";
import {BaseAppearanceService} from "../../../services/appearance/base-appearance.service";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {Logger} from "../../../common/logging/logger";

@Component({
    selector: 'app-advanced-settings',
    host: {style: 'display: block; width: 100%;'},
    templateUrl: './advanced-settings.component.html',
    styleUrls: ['./advanced-settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AdvancedSettingsComponent {
    public constructor(
        public settings: BaseSettings,
        private translator: TranslatorService,
        private collectionService: CollectionService,
        public appearance: BaseAppearanceService,
        private dialog: MatDialog,
        public router: Router,
        private logger: Logger
    ) {
    }

    public get checkForUpdatesChecked(): boolean {
        return this.settings.checkForUpdates;
    }

    public set checkForUpdatesChecked(v: boolean) {
        this.settings.checkForUpdates = v;
    }

    public get moveDeletedNotesToTrashChecked(): boolean {
        return this.settings.moveDeletedNotesToTrash;
    }

    public set moveDeletedNotesToTrashChecked(v: boolean) {
        this.settings.moveDeletedNotesToTrash = v;
    }

    public get skipTrashForEmptyNotesChecked(): boolean {
        return this.settings.skipTrashForEmptyNotes;
    }

    public set skipTrashForEmptyNotesChecked(v: boolean) {
        this.settings.skipTrashForEmptyNotes = v;
    }

    public async openDirectoryChooserAsync(): Promise<void> {
        this.logger.info('Opening directory chooser', 'AdvancedSettingsComponent', 'openDirectoryChooserAsync');

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
            this.logger.warn('No folder was selected', 'AdvancedSettingsComponent', 'openDirectoryChooserAsync');
            return;
        }

        const selectedParentDirectory: string = openDialogReturnValue.filePaths[0];
        this.logger.info(`Selected directory: '${selectedParentDirectory}'`, 'AdvancedSettingsComponent', 'openDirectoryChooserAsync');
        
        if (!(await this.collectionService.setStorageDirectoryAsync(selectedParentDirectory))) {
            const errorText: string = await this.translator.getAsync('ErrorTexts.StorageDirectoryCreationError', {
                storageDirectory: selectedParentDirectory,
            });
            this.dialog.open(ErrorDialogComponent, {
                width: '450px',
                data: {errorText: errorText},
            });
            return;
        }

        await this.collectionService.initializeAsync();

        await this.router.navigate(['/collection']);

    }
}
