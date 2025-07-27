import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule, SecurityContext } from '@angular/core';
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
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import 'reflect-metadata';
import 'zone.js/mix';
import '../polyfills';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GitHubApi } from './common/api/github-api';
import { Application } from './common/io/application';
import { BaseApplication } from './common/io/base-application';
import { ClipboardManager } from './common/io/clipboard-manager';
import { Desktop } from './common/io/desktop';
import { DocumentProxy } from './common/io/document-proxy';
import { FileAccess } from './common/io/file-access';
import { PathConverter } from './common/io/path-converter';
import { Logger } from './common/logging/logger';
import { Scheduler } from './common/scheduling/scheduler';
import { BaseSettings } from './common/settings/base-settings';
import { Settings } from './common/settings/settings';
import { ActiveNotebookAndSearchComponent } from './components/active-notebook-and-search/active-notebook-and-search.component';
import { CollectionSwitcherComponent } from './components/collection-switcher/collection-switcher.component';
import { MoveNotesBottomSheetComponent } from './components/collection/bottom-sheets/move-notes-bottom-sheet/move-notes-bottom-sheet.component';
import { CollectionComponent } from './components/collection/collection.component';
import { NoteCreator } from './components/collection/note-creator';
import { NoteTypeChooserBottomSheetComponent } from './components/collection/note-type-chooser-bottom-sheet/note-type-chooser-bottom-sheet.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { DialogHeaderComponent } from './components/dialogs/dialog-header/dialog-header.component';
import { ErrorDialogComponent } from './components/dialogs/error-dialog/error-dialog.component';
import { InputDialogComponent } from './components/dialogs/input-dialog/input-dialog.component';
import { LicenseDialogComponent } from './components/dialogs/license-dialog/license-dialog.component';
import { NotificationDialogComponent } from './components/dialogs/notification-dialog/notification-dialog.component';
import { PasswordInputDialogComponent } from './components/dialogs/password-input-dialog/password-input-dialog.component';
import { RenameCollectionDialogComponent } from './components/dialogs/rename-collection-dialog/rename-collection-dialog.component';
import { RenameNotebookDialogComponent } from './components/dialogs/rename-notebook-dialog/rename-notebook-dialog.component';
import { SetSpellCheckerLanguagesDialogComponent } from './components/dialogs/set-spell-checker-languages-dialog/set-spell-checker-languages-dialog.component';
import { FontSizeSwitcherComponent } from './components/font-size-switcher/font-size-switcher.component';
import { InformationComponent } from './components/information/information.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LogoFullComponent } from './components/logo-full/logo-full.component';
import { LogoMainComponent } from './components/logo-main/logo-main.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { SearchBottomSheetComponent } from './components/note/bottom-sheets/search-bottom-sheet/search-bottom-sheet.component';
import { ShareBottomSheetComponent } from './components/note/bottom-sheets/share-bottom-sheet/share-bottom-sheet.component';
import { SpellCheckBottomSheetComponent } from './components/note/bottom-sheets/spell-check-bottom-sheet/spell-check-bottom-sheet.component';
import { TextSizeBottomSheetComponent } from './components/note/bottom-sheets/text-size-bottom-sheet/text-size-bottom-sheet.component';
import { MarkdownNoteComponent } from './components/note/markdown-note/markdown-note.component';
import { NoteContextMenuFactory } from './components/note/note-context-menu-factory';
import { BoundaryGetter } from './components/note/note-editor/boundary-getter';
import { ImageProcessor } from './components/note/note-editor/image-processor';
import { NoteEditorFactory } from './components/note/note-editor/note-editor-factory';
import { NoteImageSaver } from './components/note/note-editor/note-image-saver';
import { QuillFactory } from './components/note/note-editor/quill-factory';
import { QuillTweaker } from './components/note/note-editor/quill-tweaker';
import { NoteStatusBarComponent } from './components/note/note-status-bar/note-status-bar.component';
import { NoteComponent } from './components/note/note.component';
import { NotebookSwitcherComponent } from './components/note/notebook-switcher/notebook-switcher.component';
import { NotesComponent } from './components/notes/notes.component';
import { SettingsTextSizeInNotesComponent } from './components/settings/settings-text-size-in-notes/settings-text-size-in-notes.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SpellCheckLanguagesComponent } from './components/spell-check-languages/spell-check-languages.component';
import { TasksProgressComponent } from './components/tasks-progress/tasks-progress.component';
import { ThemeSwitcherComponent } from './components/theme-switcher/theme-switcher.component';
import { TrashComponent } from './components/trash/trash.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { WindowControlsComponent } from './components/window-controls/window-controls.component';
import { CdkVirtualScrollViewportPatchDirective } from './directives/cdk-virtual-scroll-viewport-patch-directive';
import { WebviewDirective } from './directives/webview.directive';
import { GlobalErrorHandler } from './globalErrorHandler';
import { FixImagePathsPipe } from './pipes/fix-image-paths.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { AppearanceService } from './services/appearance/appearance.service';
import { BaseAppearanceService } from './services/appearance/base-appearance.service';
import { DefaultThemesCreator } from './services/appearance/default-themes-creator';
import { CollectionDataStoreAccess } from './services/collection/collection-data-store.access';
import { CollectionFileAccess } from './services/collection/collection-file-access';
import { CollectionPathConverter } from './services/collection/collection-path-converter';
import { CollectionClient } from './services/collection/collection.client';
import { CollectionService } from './services/collection/collection.service';
import { NoteDateFormatter } from './services/collection/note-date-formatter';
import { NoteModelFactory } from './services/collection/note-model-factory';
import { CryptographyService } from './services/cryptography/cryptography.service';
import { ElectronService } from './services/electron.service';
import { FileService } from './services/file/file.service';
import { PersistanceService } from './services/persistance/persistance.service';
import { PrintService } from './services/print/print.service';
import { SearchClient } from './services/search/search.client';
import { SearchService } from './services/search/search.service';
import { SnackBarService } from './services/snack-bar/snack-bar.service';
import { SpellCheckService } from './services/spell-check/spell-check.service';
import { TemporaryStorageService } from './services/temporary-storage/temporary-storage.service';
import { TranslatorService } from './services/translator/translator.service';
import { TrashService } from './services/trash/trash.service';
import { UpdateService } from './services/update/update.service';
import {AccentButtonComponent} from "./components/controls/accent-button/accent-button.component";
import {TransparentButtonComponent} from "./components/controls/transparent-button/transparent-button.component";
import {SubMenuItemComponent} from "./components/sub-menu/sub-menu-item/sub-menu-item.component";
import {SubMenuComponent} from "./components/sub-menu/sub-menu.component";
import {ToggleSwitchComponent} from "./components/controls/toggle-switch/toggle-switch.component";
import {IconTextButtonComponent} from "./components/controls/icon-text-button/icon-text-button.component";
import {AppearanceSettingsComponent} from "./components/settings/appearance-settings/appearance-settings.component";
import {AdvancedSettingsComponent} from "./components/settings/advanced-settings/advanced-settings.component";
import {NotesSettingsComponent} from "./components/settings/notes-settings/notes-settings.component";
import {
    InformationComponentsComponent
} from "./components/information/information-components/information-components.component";
import {InformationAboutComponent} from "./components/information/information-about/information-about.component";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Custom options the configure the tooltip's default show/hide delays.
export const CustomTooltipDefaults: MatTooltipDefaultOptions = {
    showDelay: 500,
    hideDelay: 0,
    touchendHideDelay: 0,
};

/**
 * Function that returns `MarkedOptions` with renderer override
 * See: https://github.com/jfcere/ngx-markdown/issues/315
 */
export function MarkedOptionsFactory(): MarkedOptions {
    const renderer = new MarkedRenderer();

    // remove task list bullets
    renderer.list = (body: string, ordered: boolean, start: number) => {
        const divElement = document.createElement('div');
        divElement.innerHTML = body;

        divElement.querySelectorAll('li').forEach((li) => {
            li.childNodes.forEach((child) => {
                if (child instanceof HTMLInputElement && child.type === 'checkbox') {
                    // list item
                    li.style.marginLeft = '-1.5em';
                    li.style.listStyleType = 'none';
                    // checkbox
                    child.style.margin = '0 0.2em 0.15em 0em';
                    child.style.verticalAlign = 'middle';
                }
            });
        });

        return MarkedRenderer.prototype.list.call(renderer, divElement.innerHTML, ordered, start) as string;
    };

    return { renderer };

    // See: https://snyk.io/advisor/npm-package/ngx-markdown/functions/ngx-markdown.MarkedRenderer
    // return {
    //     renderer: renderer,
    //     gfm: true,
    //     breaks: false,
    //     pedantic: false,
    //     smartLists: true,
    //     smartypants: false,
    // };
}

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
        PasswordInputDialogComponent,
        ConfirmationDialogComponent,
        TrashComponent,
        DialogHeaderComponent,
        SetSpellCheckerLanguagesDialogComponent,
        NotificationDialogComponent,
        LogoFullComponent,
        LogoMainComponent,
        MainMenuComponent,
        ActiveNotebookAndSearchComponent,
        TasksProgressComponent,
        ThemeSwitcherComponent,
        FontSizeSwitcherComponent,
        SettingsTextSizeInNotesComponent,
        NoteComponent,
        TextSizeBottomSheetComponent,
        SpellCheckBottomSheetComponent,
        MoveNotesBottomSheetComponent,
        SearchBottomSheetComponent,
        ShareBottomSheetComponent,
        SpellCheckLanguagesComponent,
        NoteTypeChooserBottomSheetComponent,
        NoteStatusBarComponent,
        MarkdownNoteComponent,
        WebviewDirective,
        CdkVirtualScrollViewportPatchDirective,
        TruncatePipe,
        FixImagePathsPipe,
        AccentButtonComponent,
        TransparentButtonComponent,
        SubMenuComponent,
        SubMenuItemComponent,
        ToggleSwitchComponent,
        IconTextButtonComponent,
        AppearanceSettingsComponent,
        AdvancedSettingsComponent,
        NotesSettingsComponent,
        InformationAboutComponent,
        InformationComponentsComponent
    ],
    imports: [
        MarkdownModule.forRoot({
            markedOptions: {
                provide: MarkedOptions,
                useFactory: MarkedOptionsFactory,
            },
            sanitize: SecurityContext.NONE, // disable sanitization
        }),
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
        CollectionClient,
        FileService,
        ClipboardManager,
        UpdateService,
        TrashService,
        PrintService,
        SpellCheckService,
        TranslatorService,
        SearchService,
        TemporaryStorageService,
        SearchClient,
        SnackBarService,
        CryptographyService,
        PersistanceService,
        QuillFactory,
        NoteContextMenuFactory,
        NoteModelFactory,
        NoteDateFormatter,
        QuillTweaker,
        GitHubApi,
        Scheduler,
        Desktop,
        Logger,
        NoteCreator,
        FileAccess,
        CollectionPathConverter,
        CollectionFileAccess,
        CollectionDataStoreAccess,
        NoteEditorFactory,
        NoteImageSaver,
        BoundaryGetter,
        PathConverter,
        ImageProcessor,
        DocumentProxy,
        DefaultThemesCreator,
        { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: CustomTooltipDefaults },
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
        { provide: BaseSettings, useClass: Settings },
        { provide: BaseApplication, useClass: Application },
        { provide: BaseAppearanceService, useClass: AppearanceService },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
