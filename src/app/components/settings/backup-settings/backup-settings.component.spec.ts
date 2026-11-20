import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as remote from '@electron/remote';
import { Mock } from 'typemoq';
import { BaseSettings } from '../../../common/settings/base-settings';
import { BackupService } from '../../../services/backup/backup.service';
import { CollectionService } from '../../../services/collection/collection.service';
import { TranslatorService } from '../../../services/translator/translator.service';
import { BackupSettingsComponent } from './backup-settings.component';

jest.mock('@electron/remote', () => ({ dialog: { showOpenDialog: jest.fn() } }));
jest.mock('../../../services/backup/backup.service', () => ({ BackupService: class {} }));
jest.mock('../../../services/collection/collection.service', () => ({ CollectionService: class {} }));
jest.mock('../../../services/translator/translator.service', () => ({ TranslatorService: class {} }));

describe('BackupSettingsComponent restore', () => {
    it.each([
        ['/cloud/backups', '/cloud/backups'],
        ['', undefined],
    ])('opens the restore picker with backup directory %s', async (directory, defaultPath) => {
        const settings = Mock.ofType<BaseSettings>();
        settings.setup((value) => value.backupDirectory).returns(() => directory);
        const backup = Mock.ofType<BackupService>();
        backup.setup((value) => value.busy).returns(() => false);
        const translator = Mock.ofType<TranslatorService>();
        translator.setup((value) => value.getAsync('Backup.Restore')).returns(async () => 'Restore');
        const component = new BackupSettingsComponent(
            backup.object,
            settings.object,
            Mock.ofType<CollectionService>().object,
            translator.object,
            Mock.ofType<MatDialog>().object,
            Mock.ofType<Router>().object,
        );
        const showOpenDialog = remote.dialog.showOpenDialog as jest.Mock;
        showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });

        await component.restoreAsync();

        expect(showOpenDialog).toHaveBeenLastCalledWith({
            title: 'Restore',
            defaultPath,
            properties: ['openFile'],
            filters: [{ name: 'Knowte backup', extensions: ['knowtebackup'] }],
        });
    });
});
