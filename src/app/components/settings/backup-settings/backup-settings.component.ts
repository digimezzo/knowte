import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as remote from '@electron/remote';
import { BaseSettings } from '../../../common/settings/base-settings';
import { BackupService } from '../../../services/backup/backup.service';
import { CollectionService } from '../../../services/collection/collection.service';
import { TranslatorService } from '../../../services/translator/translator.service';
import { ErrorDialogComponent } from '../../dialogs/error-dialog/error-dialog.component';

@Component({
    selector: 'app-backup-settings',
    templateUrl: './backup-settings.component.html',
    styleUrls: ['./backup-settings.component.scss'],
    host: { style: 'display: block;' },
})
export class BackupSettingsComponent {
    @Input() public restoreOnly: boolean = false;

    public constructor(
        public backup: BackupService,
        public settings: BaseSettings,
        private collection: CollectionService,
        private translator: TranslatorService,
        private dialog: MatDialog,
        private router: Router,
    ) {}

    public async chooseDestinationAsync(): Promise<void> {
        const result = await remote.dialog.showOpenDialog({
            title: await this.translator.getAsync('Backup.SelectFolder'),
            properties: ['openDirectory', 'createDirectory'],
        });
        if (!result.canceled && result.filePaths.length > 0) {
            this.settings.backupDirectory = result.filePaths[0];
            this.backup.configurationChanged();
        }
    }

    public clearDestination(): void {
        if (this.backup.busy) {
            return;
        }
        this.settings.backupDirectory = '';
        this.backup.configurationChanged();
    }

    public async backUpAsync(): Promise<void> {
        try {
            await this.backup.backUpAsync();
        } catch (error) {
            this.showError(error);
        }
    }

    public async restoreAsync(): Promise<void> {
        if (this.backup.busy) {
            return;
        }
        try {
            const result = await remote.dialog.showOpenDialog({
                title: await this.translator.getAsync('Backup.Restore'),
                properties: ['openFile'],
                filters: [{ name: 'Knowte backup', extensions: ['knowtebackup'] }],
            });
            if (result.canceled || result.filePaths.length === 0) {
                return;
            }
            if (!this.settings.storageDirectory) {
                const folder = await remote.dialog.showOpenDialog({
                    title: await this.translator.getAsync('Backup.SelectLocalFolder'),
                    properties: ['openDirectory', 'createDirectory'],
                });
                if (folder.canceled || folder.filePaths.length === 0) {
                    return;
                }
                if (!await this.collection.setStorageDirectoryAsync(folder.filePaths[0])) {
                    throw new Error(await this.translator.getAsync('Backup.StorageError'));
                }
            }
            await this.backup.restoreAsync(result.filePaths[0]);
            if (this.restoreOnly) {
                await this.collection.initializeAsync();
                await this.router.navigate(['/collection']);
            }
        } catch (error) {
            this.showError(error);
        }
    }

    private showError(error: Error): void {
        this.dialog.open(ErrorDialogComponent, { width: '450px', data: { errorText: error.message } });
    }
}
