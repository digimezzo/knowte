import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as remote from '@electron/remote';
import log from 'electron-log';
import * as path from 'path';
import { Subscription } from 'rxjs';
import { BaseAppearanceService } from './services/appearance/base-appearance.service';
import { CollectionService } from './services/collection/collection.service';
import { ElectronService } from './services/electron.service';
import { SpellCheckService } from './services/spell-check/spell-check.service';
import { TemporaryStorageService } from './services/temporary-storage/temporary-storage.service';
import { TrashService } from './services/trash/trash.service';
import { BackupService } from './services/backup/backup.service';
import { PerformanceDiagnostics } from './common/logging/performance-diagnostics';
import { BaseSettings } from './common/settings/base-settings';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    private subscription: Subscription = new Subscription();
    private stopPerformanceMonitoring: () => void;

    constructor(
        public electron: ElectronService,
        public router: Router,
        public appearance: BaseAppearanceService,
        private collectionService: CollectionService,
        private spellCheckerService: SpellCheckService,
        private temporaryStorageService: TemporaryStorageService,
        private trash: TrashService,
        private backup: BackupService,
        private zone: NgZone,
        private settings: BaseSettings,
    ) {
        log.create('renderer');
        log.transports.file.resolvePath = () => path.join(remote.app.getPath('userData'), 'logs', 'Knowte.log');
        PerformanceDiagnostics.configure(this.settings.performanceDiagnosticsEnabled);
    }

    @ViewChild('drawer') public drawer: any;

    public ngOnDestroy(): void {
        this.stopPerformanceMonitoring?.();
        this.subscription.unsubscribe();
    }

    public ngOnInit(): void {
        this.zone.runOutsideAngular(() => {
            this.stopPerformanceMonitoring = PerformanceDiagnostics.monitorEventLoop(this.isNoteWindow() ? 'Note window' : 'Main window');
        });
        if (!this.isNoteWindow()) {
            this.temporaryStorageService.clearDecryptedMarkdownAttachmentsCache();
            this.backup.start();
        }

        this.appearance.applyAppearance();
        this.spellCheckerService.applyActiveSpellCheckLanguagesIfEnabled();

        this.subscription.add(
            this.trash.openTrashRequested$.subscribe(() => {
                if (this.drawer != undefined) {
                    this.drawer.toggle();
                }
            }),
        );

        const showWelcome: boolean = !this.collectionService.hasCollections();

        if (showWelcome) {
            this.router.navigate(['/welcome']);
        }
    }

    private isNoteWindow(): boolean {
        const currentHashRoute: string = window.location.hash || '';
        return currentHashRoute.includes('/note');
    }
}
