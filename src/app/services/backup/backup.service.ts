import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { BaseSettings } from '../../common/settings/base-settings';
import { Logger } from '../../common/logging/logger';
import { CollectionService } from '../collection/collection.service';

interface BackupResult {
    collection: string;
    skipped: boolean;
    file?: string;
    createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class BackupService implements OnDestroy {
    public busy: boolean = false;
    public activeAction: 'backup' | 'restore' | undefined = undefined;
    public nextAttempt: number = 0;
    public restoredCollection: string = '';
    private timer: ReturnType<typeof setInterval>;
    private checkpointListener = async (_event: IpcRendererEvent, request: { id: number; collection: string; storage: string }) => {
        try {
            const token = await this.collection.prepareBackupAsync(request.collection, request.storage);
            ipcRenderer.send('backup-checkpoint-result', { id: request.id, token });
        } catch (error) {
            ipcRenderer.send('backup-checkpoint-result', { id: request.id, error: error.message });
        }
    };

    public constructor(
        public settings: BaseSettings,
        private collection: CollectionService,
        private logger: Logger,
        private zone: NgZone,
    ) {}

    public start(): void {
        if (this.timer) {
            return;
        }
        ipcRenderer.on('backup-checkpoint', this.checkpointListener);
        this.nextAttempt = Math.max(Date.now() + 15000,
            Date.parse(this.settings.backupLastSuccess || '1970-01-01') + this.settings.backupIntervalMinutes * 60000);
        this.zone.runOutsideAngular(() => {
            this.timer = setInterval(() => {
                if (this.settings.backupEnabled && !this.busy && this.collection.hasCollections() &&
                    Date.now() >= this.nextAttempt) {
                    this.zone.run(() => this.runScheduledBackupAsync());
                }
            }, 15000);
        });
    }

    public configurationChanged(): void {
        this.settings.backupLastError = '';
        this.nextAttempt = Date.now() + 15000;
    }

    public async backUpAsync(force: boolean = true): Promise<BackupResult[]> {
        if (!this.settings.backupDirectory) {
            throw new Error('Select a backup folder first.');
        }
        if (!Number.isInteger(this.settings.backupIntervalMinutes) || this.settings.backupIntervalMinutes < 15 ||
            this.settings.backupIntervalMinutes > 180) {
            throw new Error('Choose a backup interval between 15 and 180 minutes.');
        }
        if (!Number.isInteger(this.settings.backupRetentionCount) || this.settings.backupRetentionCount < 1 ||
            this.settings.backupRetentionCount > 20) {
            throw new Error('Keep between 1 and 20 backups per collection.');
        }
        const result: BackupResult[] = await this.runAsync('backup', {
            storage: this.settings.storageDirectory,
            destination: this.settings.backupDirectory,
            retention: this.settings.backupRetentionCount,
            force,
        });
        this.settings.backupLastSuccess = new Date().toISOString();
        this.nextAttempt = Date.now() + this.settings.backupIntervalMinutes * 60000;
        return result;
    }

    public async restoreAsync(archive: string): Promise<string> {
        const result: { collection: string } = await this.runAsync('restore', {
            archive,
            storage: this.settings.storageDirectory,
        });
        this.restoredCollection = result.collection;
        this.collection.restoredCollectionAvailable();
        return result.collection;
    }

    private async runAsync<T>(action: 'backup' | 'restore', options: object): Promise<T> {
        if (this.busy) {
            throw new Error('A backup or restore is already running.');
        }
        this.busy = true;
        this.activeAction = action;
        this.settings.backupLastError = '';
        try {
            return await ipcRenderer.invoke('backup-run', { action, options });
        } catch (error) {
            this.settings.backupLastError = error.message;
            this.logger.error(`Backup operation failed: ${error.message}`, 'BackupService', 'runAsync');
            throw error;
        } finally {
            this.zone.run(() => {
                this.busy = false;
                this.activeAction = undefined;
            });
        }
    }

    private async runScheduledBackupAsync(): Promise<void> {
        try {
            await this.backUpAsync(false);
        } catch (error) {
            this.settings.backupLastError = error.message;
            this.logger.error(`Automatic backup failed: ${error.message}`, 'BackupService', 'runScheduledBackupAsync');
            this.nextAttempt = Date.now() + 5 * 60000;
        }
    }

    public ngOnDestroy(): void {
        clearInterval(this.timer);
        ipcRenderer.removeListener('backup-checkpoint', this.checkpointListener);
    }
}
