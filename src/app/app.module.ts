import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Services
import { ElectronService } from './services/electron.service';
import { CollectionService } from './services/collection.service';

// Stores
import { DataStore } from './data/dataStore';

// Directives
import { WebviewDirective } from './directives/webview.directive';

// Components
import { AppComponent } from './app.component';
import { BackButtonComponent } from './components/backButton/backButton.component';
import { MainMenuButtonComponent } from './components/mainMenuButton/mainMenuButton.component';
import { SettingsComponent } from './components/settings/settings.component';
import { InformationComponent } from './components/information/information.component';
import { LicenseDialogComponent } from './components/dialogs/licenseDialog/licenseDialog.component';
import { LogoFullComponent } from './components/logoFull/logoFull.component';
import { InputDialogComponent } from './components/dialogs/inputDialog/inputDialog.component';
import { ErrorDialogComponent } from './components/dialogs/errorDialog/errorDialog.component';
import { MainComponent } from './components/main/main.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoadingComponent } from './components/loading/loading.component';
import { NotesComponent } from './components/notes/notes.component';
import { RenameCollectionDialogComponent } from './components/dialogs/renameCollectionDialog/renameCollectionDialog.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmationDialog/confirmationDialog.component';

// Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule, MatButtonModule, MatMenuModule, MatIconModule, MatDividerModule, MatTooltipModule, 
  MatDialogModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule,
  MatListModule } from '@angular/material';
import { GlobalErrorHandler } from './globalErrorHandler';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    BackButtonComponent,
    MainMenuButtonComponent,
    MainComponent,
    WelcomeComponent,
    LoadingComponent,
    NotesComponent,
    SettingsComponent,
    InformationComponent,
    LicenseDialogComponent,
    RenameCollectionDialogComponent,
    ErrorDialogComponent,
    InputDialogComponent,
    ConfirmationDialogComponent,
    LogoFullComponent,
    WebviewDirective
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
    BrowserAnimationsModule,
    BrowserModule,
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
    DataStore,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [AppComponent, BackButtonComponent, MainMenuButtonComponent],
  entryComponents: [
    LicenseDialogComponent, InputDialogComponent, ErrorDialogComponent, RenameCollectionDialogComponent,
    ConfirmationDialogComponent
  ],
})
export class AppModule { }
