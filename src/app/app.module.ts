import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipDefaultOptions, MatTooltipModule, MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AngularSplitModule } from 'angular-split';
import 'reflect-metadata';
import 'zone.js/mix';
import '../polyfills';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ActiveNotebookAndSearchComponent } from './components/active-notebook-and-search/active-notebook-and-search.component';
import { CollectionSwitcherComponent } from './components/collection-switcher/collection-switcher.component';
import { CollectionComponent } from './components/collection/collection.component';
import { ColorSchemeSwitcherComponent } from './components/color-scheme-switcher/color-scheme-switcher.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { DialogHeaderComponent } from './components/dialogs/dialog-header/dialog-header.component';
import { ErrorDialogComponent } from './components/dialogs/error-dialog/error-dialog.component';
import { ImportFromOldVersionDialogComponent } from './components/dialogs/import-from-old-version-dialog/import-from-old-version-dialog.component';
import { InputDialogComponent } from './components/dialogs/input-dialog/input-dialog.component';
import { LicenseDialogComponent } from './components/dialogs/license-dialog/license-dialog.component';
import { RenameCollectionDialogComponent } from './components/dialogs/rename-collection-dialog/rename-collection-dialog.component';
import { RenameNotebookDialogComponent } from './components/dialogs/rename-notebook-dialog/rename-notebook-dialog.component';
import { SetSpellCheckerLanguagesDialogComponent } from './components/dialogs/set-spell-checker-languages-dialog/set-spell-checker-languages-dialog.component';
import { FontSizeSwitcherComponent } from './components/font-size-switcher/font-size-switcher.component';
import { InformationComponent } from './components/information/information.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LogoFullComponent } from './components/logo-full/logo-full.component';
import { LogoMainComponent } from './components/logo-main/logo-main.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { SpellCheckBottomSheetComponent } from './components/note/bottom-sheets/spell-check-bottom-sheet/spell-check-bottom-sheet.component';
import { SpellingSuggestionsBottomSheetComponent } from './components/note/bottom-sheets/spelling-suggestions-bottom-sheet/spelling-suggestions-bottom-sheet.component';
import { TextSizeBottomSheetComponent } from './components/note/bottom-sheets/text-size-bottom-sheet/text-size-bottom-sheet.component';
import { NoteStatusBarComponent } from './components/note/note-status-bar/note-status-bar.component';
import { NoteComponent } from './components/note/note.component';
import { NotebookSwitcherComponent } from './components/notebook-switcher/notebook-switcher.component';
import { NotesComponent } from './components/notes/notes.component';
import { SettingsTextSizeInNotesComponent } from './components/settings/settings-text-size-in-notes/settings-text-size-in-notes.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SpellCheckLanguagesComponent } from './components/spell-check-languages/spell-check-languages.component';
import { TasksProgressComponent } from './components/tasks-progress/tasks-progress.component';
import { TrashComponent } from './components/trash/trash.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { WindowControlsComponent } from './components/window-controls/window-controls.component';
import { BaseSettings } from './core/base-settings';
import { ClipboardManager } from './core/clipboard-manager';
import { DateFormatter } from './core/date-formatter';
import { Desktop } from './core/desktop';
import { FileSystem } from './core/file-system';
import { GitHubApi } from './core/github-api';
import { Scheduler } from './core/scheduler';
import { Settings } from './core/settings';
import { DataStore } from './data/data-store';
import { CdkVirtualScrollViewportPatchDirective } from './directives/cdk-virtual-scroll-viewport-patch-directive';
import { WebviewDirective } from './directives/webview.directive';
import { GlobalErrorHandler } from './globalErrorHandler';
import { TruncatePipe } from './pipes/truncate.pipe';
import { CollectionService } from './services/collection/collection.service';
import { ElectronService } from './services/electron.service';
import { FileService } from './services/file/file.service';
import { PrintService } from './services/print/print.service';
import { SpellCheckService } from './services/spell-check/spell-check.service';
import { TrashService } from './services/trash/trash.service';
import { UpdateService } from './services/update/update.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/** Custom options the configure the tooltip's default show/hide delays. */
export const CustomTooltipDefaults: MatTooltipDefaultOptions = {
    showDelay: 500,
    hideDelay: 0,
    touchendHideDelay: 0,
};

@NgModule({
    declarations: [
        AppComponent,
        WindowControlsComponent,
        CollectionSwitcherComponent,
        NotebookSwitcherComponent,
        WelcomeComponent,
        LoadingComponent,
        CollectionComponent,
        NotesComponent,
        SettingsComponent,
        InformationComponent,
        LicenseDialogComponent,
        RenameCollectionDialogComponent,
        RenameNotebookDialogComponent,
        ErrorDialogComponent,
        InputDialogComponent,
        ConfirmationDialogComponent,
        TrashComponent,
        DialogHeaderComponent,
        ImportFromOldVersionDialogComponent,
        SetSpellCheckerLanguagesDialogComponent,
        LogoFullComponent,
        LogoMainComponent,
        MainMenuComponent,
        ActiveNotebookAndSearchComponent,
        TasksProgressComponent,
        ColorSchemeSwitcherComponent,
        FontSizeSwitcherComponent,
        SettingsTextSizeInNotesComponent,
        NoteComponent,
        TextSizeBottomSheetComponent,
        SpellCheckBottomSheetComponent,
        SpellingSuggestionsBottomSheetComponent,
        SpellCheckLanguagesComponent,
        NoteStatusBarComponent,
        WebviewDirective,
        CdkVirtualScrollViewportPatchDirective,
        TruncatePipe,
    ],
    imports: [
        MatListModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatTabsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatRippleModule,
        MatSidenavModule,
        MatCheckboxModule,
        MatBottomSheetModule,
        BrowserAnimationsModule,
        BrowserModule,
        ScrollingModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        AngularSplitModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
    ],
    providers: [
        ElectronService,
        CollectionService,
        Settings,
        FileService,
        ClipboardManager,
        UpdateService,
        TrashService,
        PrintService,
        SpellCheckService,
        GitHubApi,
        DateFormatter,
        Scheduler,
        Desktop,
        FileSystem,
        { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: CustomTooltipDefaults },
        DataStore,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
        { provide: BaseSettings, useClass: Settings },
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        LicenseDialogComponent,
        InputDialogComponent,
        ErrorDialogComponent,
        RenameCollectionDialogComponent,
        ImportFromOldVersionDialogComponent,
        RenameNotebookDialogComponent,
        ConfirmationDialogComponent,
        SetSpellCheckerLanguagesDialogComponent,
        TrashComponent,
    ],
})
export class AppModule {}
