import { Component, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { TranslatorService } from './services/translator/translator.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    private subscription: Subscription = new Subscription();
    private stopPerformanceMonitoring: () => void;
    private isClosingAllowed: boolean = false;
    private isPreparingClose: boolean = false;

    constructor(
        public electron: ElectronService,
        public router: Router,
        public appearance: BaseAppearanceService,
        private collectionService: CollectionService,
        private spellCheckerService: SpellCheckService,
        private temporaryStorageService: TemporaryStorageService,
        public trash: TrashService,
        private backup: BackupService,
        private zone: NgZone,
        private settings: BaseSettings,
        private dialog: MatDialog,
        private translator: TranslatorService,
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

    @HostListener('window:beforeunload', ['$event'])
    public beforeunloadHandler(event: BeforeUnloadEvent): void {
        if (this.isNoteWindow() || this.isClosingAllowed || !this.collectionService.hasOpenNotes()) {
            return;
        }

        // Notes can only save while the main window is alive, so close them first.
        event.preventDefault();
        event.returnValue = '';
        if (!this.isPreparingClose) {
            void this.saveNotesAndCloseAsync();
        }
    }

    private async saveNotesAndCloseAsync(): Promise<void> {
        this.isPreparingClose = true;
        try {
            const allSaved: boolean = await this.collectionService.saveAndCloseAllNotesAsync();
            if (!allSaved && !(await this.hasConfirmedToCloseWithUnsavedNotesAsync())) {
                return;
            }

            this.isClosingAllowed = true;
            const mainWindow = remote.getCurrentWindow();
            if (!allSaved) {
                // Unsaved note windows would otherwise keep refusing to close.
                remote.BrowserWindow.getAllWindows()
                    .filter((window) => window.id !== mainWindow.id)
                    .forEach((window) => window.destroy());
            }
            mainWindow.close();
        } finally {
            this.isPreparingClose = false;
        }
    }

    private async hasConfirmedToCloseWithUnsavedNotesAsync(): Promise<boolean> {
        const dialogTitle: string = await this.translator.getAsync('DialogTitles.CloseWithUnsavedNotes');
        const dialogText: string = await this.translator.getAsync('DialogTexts.CloseWithUnsavedNotes');
        const result: boolean = await this.zone.run(() =>
            this.dialog.open(ConfirmationDialogComponent, { width: '450px', data: { dialogTitle, dialogText } })
                .afterClosed().toPromise(),
        );
        return !!result;
    }

    private isNoteWindow(): boolean {
        const currentHashRoute: string = window.location.hash || '';
        return currentHashRoute.includes('/note');
    }
}
