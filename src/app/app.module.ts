import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Services
import { ElectronService } from './services/electron.service';
import { CollectionService } from './services/collection/collection.service';

// Stores
import { DataStore } from './data/data-store';

// Directives
import { WebviewDirective } from './directives/webview.directive';

// Components
import { AppComponent } from './app.component';
import { WindowControlsComponent } from './components/window-controls/window-controls.component';
import { CollectionSwitcherComponent } from './components/collection-switcher/collection-switcher.component';
import { SettingsComponent } from './components/settings/settings.component';
import { InformationComponent } from './components/information/information.component';
import { NoteComponent } from './components/note/note.component';
import { LicenseDialogComponent } from './components/dialogs/licenseDialog/licenseDialog.component';
import { LogoFullComponent } from './components/logo-full/logo-full.component';
import { InputDialogComponent } from './components/dialogs/inputDialog/inputDialog.component';
import { ErrorDialogComponent } from './components/dialogs/errorDialog/errorDialog.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoadingComponent } from './components/loading/loading.component';
import { CollectionComponent } from './components/collection/collection.component';
import { NotesComponent } from './components/notes/notes.component';
import { RenameCollectionDialogComponent } from './components/dialogs/renameCollectionDialog/renameCollectionDialog.component';
import { RenameNotebookDialogComponent } from './components/dialogs/renameNotebookDialog/renameNotebookDialog.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmationDialog/confirmationDialog.component';
import { DialogHeaderComponent } from './components/dialogs/dialogHeader/dialogHeader.component';
import { ChangeNotebookDialogComponent } from './components/dialogs/changeNotebookDialog/changeNotebookDialog.component';
import { ImportFromOldVersionDialogComponent } from './components/dialogs/importFromOldVersionDialog/importFromOldVersionDialog.component';

// Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule, MatButtonModule, MatMenuModule, MatIconModule, MatDividerModule, MatTooltipModule, 
  MatDialogModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule,
  MatListModule, MatSelectModule, MatSlideToggleModule, MatRippleModule } from '@angular/material';
import { GlobalErrorHandler } from './globalErrorHandler';
import { ActiveNotebookAndSearchComponent } from './components/active-notebook-and-search/active-notebook-and-search.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { FileService } from './services/file/file.service';
import { TasksProgressComponent } from './components/tasksProgressComponent/tasksProgress.component';
import { ColorThemeSwitcherComponent } from './components/color-theme-switcher/color-theme-switcher.component';
import { LogoMenuComponent } from './components/logo-menu/logo-menu.component';
import { SettingsService } from './services/settings/settings.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    WindowControlsComponent,
    CollectionSwitcherComponent,
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
    ChangeNotebookDialogComponent,
    ImportFromOldVersionDialogComponent,
    LogoFullComponent,
    LogoMenuComponent,
    ActiveNotebookAndSearchComponent,
    TasksProgressComponent,
    ColorThemeSwitcherComponent,
    NoteComponent,
    WebviewDirective,
    TruncatePipe
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
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    ElectronService,
    CollectionService,
    SettingsService,
    FileService,
    DataStore,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    LicenseDialogComponent, InputDialogComponent, ErrorDialogComponent, RenameCollectionDialogComponent, 
    ImportFromOldVersionDialogComponent, RenameNotebookDialogComponent, ConfirmationDialogComponent, 
    ChangeNotebookDialogComponent
  ],
})
export class AppModule { }
