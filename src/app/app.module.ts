import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
import { NoteStore } from './data/noteStore';

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
import { AddCollectionDialogComponent } from './components/dialogs/addCollectionDialog/addCollectionDialog.component';
import { ErrorDialogComponent } from './components/dialogs/errorDialog/errorDialog.component';
import { MainComponent } from './components/main/main.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { NotesComponent } from './components/notes/notes.component';

// Modules
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule, MatButtonModule, MatMenuModule, MatIconModule, MatDividerModule, MatTooltipModule, MatDialogModule} from '@angular/material';
import { FlexLayoutModule } from "@angular/flex-layout";

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
    NotesComponent,
    SettingsComponent,
    InformationComponent,
    LicenseDialogComponent,
    AddCollectionDialogComponent,
    ErrorDialogComponent,
    LogoFullComponent,
    WebviewDirective
  ],
  imports: [
    FlexLayoutModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    MatButtonModule,
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
  providers: [ElectronService, CollectionService, NoteStore],
  bootstrap: [AppComponent, BackButtonComponent, MainMenuButtonComponent],
  entryComponents: [
    LicenseDialogComponent, AddCollectionDialogComponent, ErrorDialogComponent
  ],
})
export class AppModule { }
