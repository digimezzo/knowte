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

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { MainMenuButtonComponent } from './components/main-menu-button/main-menu-button.component';
import { NotesComponent } from './components/notes/notes.component';
import { SettingsComponent } from './components/settings/settings.component';
import { InformationComponent } from './components/information/information.component';
import { LicenseDialogComponent } from './components/license-dialog/license-dialog.component';

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
    NotesComponent,
    SettingsComponent,
    InformationComponent,
    LicenseDialogComponent,
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
  providers: [ElectronService],
  bootstrap: [AppComponent, BackButtonComponent, MainMenuButtonComponent],
  entryComponents: [
    LicenseDialogComponent
  ],
})
export class AppModule { }
