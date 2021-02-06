import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
// Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { AngularSplitModule } from 'angular-split';
import 'reflect-metadata';
import 'zone.js/dist/zone-mix';
import '../polyfills';
import { AppRoutingModule } from './app-routing.module';
// Components
import { AppComponent } from './app.component';
import { ActiveNotebookAndSearchComponent } from './components/active-notebook-and-search/active-notebook-and-search.component';
import { CollectionSwitcherComponent } from './components/collection-switcher/collection-switcher.component';
import { CollectionComponent } from './components/collection/collection.component';
import { ColorThemeSwitcherComponent } from './components/color-theme-switcher/color-theme-switcher.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { DialogHeaderComponent } from './components/dialogs/dialog-header/dialog-header.component';
import { ErrorDialogComponent } from './components/dialogs/error-dialog/error-dialog.component';
import { ImportFromOldVersionDialogComponent } from './components/dialogs/import-from-old-version-dialog/import-from-old-version-dialog.component';
import { InputDialogComponent } from './components/dialogs/input-dialog/input-dialog.component';
import { LicenseDialogComponent } from './components/dialogs/license-dialog/license-dialog.component';
import { RenameCollectionDialogComponent } from './components/dialogs/rename-collection-dialog/rename-collection-dialog.component';
import { RenameNotebookDialogComponent } from './components/dialogs/rename-notebook-dialog/rename-notebook-dialog.component';
import { FontSizeSwitcherComponent } from './components/font-size-switcher/font-size-switcher.component';
import { InformationComponent } from './components/information/information.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LogoFullComponent } from './components/logo-full/logo-full.component';
import { LogoMainComponent } from './components/logo-main/logo-main.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { NoteComponent } from './components/note/note.component';
import { NotebookSwitcherComponent } from './components/notebook-switcher/notebook-switcher.component';
import { NotesComponent } from './components/notes/notes.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TasksProgressComponent } from './components/tasks-progress/tasks-progress.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { WindowControlsComponent } from './components/window-controls/window-controls.component';
import { ClipboardManager } from './core/clipboard-manager';
import { GitHubApi } from './core/github-api';
import { ProductDetails } from './core/product-details';
import { Settings } from './core/settings';
import { WorkerManager } from './core/worker-manager';
// Stores
import { DataStore } from './data/data-store';
// Directives
import { WebviewDirective } from './directives/webview.directive';
import { GlobalErrorHandler } from './globalErrorHandler';
import { TruncatePipe } from './pipes/truncate.pipe';
import { AppService } from './services/app/app.service';
import { CollectionService } from './services/collection/collection.service';
// Services
import { ElectronService } from './services/electron.service';
import { FileService } from './services/file/file.service';
import { UpdateService } from './services/update/update.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
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
        ConfirmationDialogComponent,
        DialogHeaderComponent,
        ImportFromOldVersionDialogComponent,
        LogoFullComponent,
        LogoMainComponent,
        MainMenuComponent,
        ActiveNotebookAndSearchComponent,
        TasksProgressComponent,
        ColorThemeSwitcherComponent,
        FontSizeSwitcherComponent,
        NoteComponent,
        WebviewDirective,
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
        BrowserAnimationsModule,
        BrowserModule,
        ScrollingModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        // AngularSplitModule,
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
        WorkerManager,
        UpdateService,
        AppService,
        GitHubApi,
        ProductDetails,
        DataStore,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
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
    ],
})
export class AppModule {}
