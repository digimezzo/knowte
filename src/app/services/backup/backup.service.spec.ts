import { NgZone } from '@angular/core';
import { ipcRenderer } from 'electron';
import { It, Mock } from 'typemoq';
import { setImmediate } from 'timers';
import { Logger } from '../../common/logging/logger';
import { Settings } from '../../common/settings/settings';
import { CollectionService } from '../collection/collection.service';
import { BackupService } from './backup.service';

const storedSettings = new Map<string, unknown>();
jest.mock('electron-store', () => class {
    public has(key: string): boolean { return storedSettings.has(key); }
    public get(key: string, fallback?: unknown): unknown {
        return storedSettings.has(key) ? storedSettings.get(key) : fallback;
    }
    public set(key: string, value: unknown): void { storedSettings.set(key, value); }
});
jest.mock('electron', () => ({ ipcRenderer: {
    invoke: jest.fn(), on: jest.fn(), send: jest.fn(), removeListener: jest.fn(),
} }));
jest.mock('../collection/collection.service', () => ({ CollectionService: class {} }));

describe('BackupService', () => {
    let service: BackupService;
    let settings: Settings;
    let prepare: jest.Mock;
    let restored: jest.Mock;

    async function advanceTime(milliseconds: number): Promise<void> {
        jest.advanceTimersByTime(milliseconds);
        await new Promise<void>((resolve) => setImmediate(resolve));
    }

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        storedSettings.clear();
        settings = new Settings();
        settings.storageDirectory = '/local/collections';
        settings.backupDirectory = '/cloud/backups';
        const collection = Mock.ofType<CollectionService>();
        prepare = jest.fn().mockResolvedValue('revision');
        restored = jest.fn();
        collection.setup((value) => value.prepareBackupAsync(It.isAnyString(), It.isAnyString())).returns(prepare);
        collection.setup((value) => value.hasCollections()).returns(() => true);
        collection.setup((value) => value.restoredCollectionAvailable()).callback(restored);
        const zone = Mock.ofType<NgZone>();
        zone.setup((value) => value.run(It.isAny())).returns((callback: () => void) => callback());
        zone.setup((value) => value.runOutsideAngular(It.isAny())).returns((callback: () => void) => callback());
        service = new BackupService(settings, collection.object, Mock.ofType<Logger>().object, zone.object);
        (ipcRenderer.invoke as jest.Mock).mockResolvedValue([{ collection: 'Work', skipped: false }]);
    });

    afterEach(() => {
        service.ngOnDestroy();
        jest.useRealTimers();
    });

    it('only schedules backups when explicitly enabled', async () => {
        service.start();
        await advanceTime(15000);
        expect(ipcRenderer.invoke).not.toHaveBeenCalled();
        settings.backupEnabled = true;
        await advanceTime(15000);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('backup-run', {
            action: 'backup',
            options: { storage: '/local/collections', destination: '/cloud/backups', retention: 5, force: false },
        });
        expect(settings.backupLastSuccess).not.toBe('');
    });

    it('honors the configured interval after a successful check', async () => {
        settings.backupEnabled = true;
        settings.backupIntervalMinutes = 15;
        service.start();
        await advanceTime(15000);
        expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1);
        await advanceTime(885000);
        expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1);
        await advanceTime(15000);
        expect(ipcRenderer.invoke).toHaveBeenCalledTimes(2);
    });

    it.each([true, false])('quietly postpones a changing collection (manual=%s) without recording success', async (manual) => {
        (ipcRenderer.invoke as jest.Mock).mockResolvedValue({ postponed: true });
        settings.backupLastSuccess = '2026-10-18T12:00:00Z';
        await expect(service.backUpAsync(manual)).resolves.toBeUndefined();
        expect(settings.backupLastSuccess).toBe('2026-10-18T12:00:00Z');
        expect(settings.backupLastError).toBe('');
        expect(service.nextAttempt).toBe(Date.now() + 5 * 60000);
        expect(service.busy).toBe(false);
    });

    it('reports failed automatic backups and retries after five minutes', async () => {
        settings.backupEnabled = true;
        (ipcRenderer.invoke as jest.Mock).mockRejectedValue(new Error('Destination offline'));
        service.start();
        await advanceTime(15000);
        expect(settings.backupLastError).toContain('Destination offline');
        expect(settings.backupLastSuccess).toBe('');
        await advanceTime(285000);
        expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1);
        await advanceTime(15000);
        expect(ipcRenderer.invoke).toHaveBeenCalledTimes(2);
    });

    it('does not overlap scheduled work with a manual backup', async () => {
        settings.backupEnabled = true;
        let finish: (result: unknown[]) => void;
        (ipcRenderer.invoke as jest.Mock).mockImplementation(() => new Promise((resolve) => finish = resolve));
        service.start();
        const backup = service.backUpAsync();
        expect(service.busy).toBe(true);
        expect(service.activeAction).toBe('backup');
        await advanceTime(60000);
        expect(ipcRenderer.invoke).toHaveBeenCalledTimes(1);
        await expect(service.restoreAsync('/backup.knowtebackup')).rejects.toThrow('already running');
        finish([]);
        await backup;
        expect(service.busy).toBe(false);
        expect(service.activeAction).toBeUndefined();
    });

    it('tracks the restore action separately from the backup action', async () => {
        let finish: (result: unknown) => void;
        (ipcRenderer.invoke as jest.Mock).mockImplementation(() => new Promise((resolve) => finish = resolve));
        const restoring = service.restoreAsync('/backup.knowtebackup');
        expect(service.busy).toBe(true);
        expect(service.activeAction).toBe('restore');
        finish({ collection: 'Work' });
        await restoring;
        expect(service.busy).toBe(false);
        expect(service.activeAction).toBeUndefined();
    });

    it('responds to worker checkpoints with saved note revisions', async () => {
        service.start();
        const listener = (ipcRenderer.on as jest.Mock).mock.calls.find(([name]) => name === 'backup-checkpoint')[1];
        await listener({}, { id: 3, collection: 'Work', storage: '/local/collections' });
        expect(prepare).toHaveBeenCalledWith('Work', '/local/collections');
        expect(ipcRenderer.send).toHaveBeenCalledWith('backup-checkpoint-result', { id: 3, token: 'revision' });
        prepare.mockRejectedValue(new Error('Still saving'));
        await listener({}, { id: 4, collection: 'Work', storage: '/local/collections' });
        expect(ipcRenderer.send).toHaveBeenCalledWith('backup-checkpoint-result', { id: 4, error: 'Still saving' });
    });

    it('announces the restored collection without activating it or changing backup success time', async () => {
        (ipcRenderer.invoke as jest.Mock).mockResolvedValue({ collection: 'Work (restored)' });
        expect(await service.restoreAsync('/backup.knowtebackup')).toBe('Work (restored)');
        expect(service.restoredCollection).toBe('Work (restored)');
        expect(restored).toHaveBeenCalledTimes(1);
        expect(settings.backupLastSuccess).toBe('');
        expect(settings.activeCollection).toBeUndefined();
    });

    it.each([0, 14, 181, 10081, 1.5, NaN])('rejects invalid interval %s before starting work', async (interval) => {
        settings.backupIntervalMinutes = interval;
        await expect(service.backUpAsync()).rejects.toThrow('between 15 and 180');
        expect(ipcRenderer.invoke).not.toHaveBeenCalled();
    });

    it.each([0, 21, 1000, 1.5, NaN])('rejects invalid retention %s before starting work', async (retention) => {
        settings.backupRetentionCount = retention;
        await expect(service.backUpAsync()).rejects.toThrow('between 1 and 20');
        expect(ipcRenderer.invoke).not.toHaveBeenCalled();
    });

    it.each([1, 10, 20])('passes configurable retention %s to the worker', async (retention) => {
        settings.backupRetentionCount = retention;
        await service.backUpAsync();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('backup-run', {
            action: 'backup',
            options: expect.objectContaining({ retention }),
        });
    });
});
