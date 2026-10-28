import * as remote from '@electron/remote';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Mock } from 'typemoq';
import { Logger } from '../../../common/logging/logger';
import { BaseSettings } from '../../../common/settings/base-settings';
import { AdvancedSettingsComponent } from './advanced-settings.component';

jest.mock('@electron/remote', () => ({
    app: { getPath: jest.fn(() => '/user data/Knowte') },
    shell: { openPath: jest.fn() },
}));
jest.mock('fs-extra', () => ({ ensureDir: jest.fn() }));
jest.mock('../../../services/collection/collection.service', () => ({ CollectionService: class {} }));
jest.mock('../../../services/translator/translator.service', () => ({ TranslatorService: class {} }));
jest.mock('../../../common/logging/logger');

describe('AdvancedSettingsComponent log directory', () => {
    let component: AdvancedSettingsComponent;
    let logger: Logger;
    const directory = path.join('/user data/Knowte', 'logs');

    beforeEach(() => {
        jest.clearAllMocks();
        logger = new Logger();
        component = new AdvancedSettingsComponent(
            Mock.ofType<BaseSettings>().object, undefined, undefined, undefined, undefined, undefined, logger,
        );
        (fs.ensureDir as jest.Mock).mockResolvedValue(undefined);
        (remote.shell.openPath as jest.Mock).mockResolvedValue('');
    });

    it.each([true, false])('opens the platform user-data logs directory with diagnostics enabled=%s', async (enabled) => {
        const settings = Mock.ofType<BaseSettings>();
        settings.setup((value) => value.performanceDiagnosticsEnabled).returns(() => enabled);
        component.settings = settings.object;
        await component.openLogDirectoryAsync();
        expect(remote.app.getPath).toHaveBeenCalledWith('userData');
        expect(fs.ensureDir).toHaveBeenCalledWith(directory);
        expect(remote.shell.openPath).toHaveBeenCalledWith(directory);
        expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs folder-creation failures without trying to open it', async () => {
        (fs.ensureDir as jest.Mock).mockRejectedValue(new Error('Access denied'));
        await component.openLogDirectoryAsync();
        expect(remote.shell.openPath).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Access denied'), 'AdvancedSettingsComponent', 'openLogDirectoryAsync',
        );
    });

    it.each(['returned error', 'rejected promise'])('logs an opener failure: %s', async (mode) => {
        if (mode === 'returned error') {
            (remote.shell.openPath as jest.Mock).mockResolvedValue('No file manager');
        } else {
            (remote.shell.openPath as jest.Mock).mockRejectedValue(new Error('No file manager'));
        }
        await component.openLogDirectoryAsync();
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('No file manager'), 'AdvancedSettingsComponent', 'openLogDirectoryAsync',
        );
    });
});
