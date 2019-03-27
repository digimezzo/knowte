import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { CollectionService } from './services/collection.service';
import log from 'electron-log';
import { Router } from '@angular/router';
import * as Store from 'electron-store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public electronService: ElectronService, public router: Router,
    private translateService: TranslateService, private collectionService: CollectionService) {

    this.initializeSettings();

    translateService.setDefaultLang('en');
    translateService.use(this.settings.get('language'));

    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  public selectedTheme: string = "pink-theme";

  private settings: Store = new Store();

  ngOnInit() {
    let showWelcome: boolean = !this.collectionService.hasStorageDirectory;

    if (showWelcome) {
      this.router.navigate(['/welcome']);
    }
  }

  ngOnDestroy() {
  }

  private initializeSettings(): void {
    if (!this.settings.has('language')) {
      this.settings.set('language', 'en');
    }

    if (!this.settings.has('closeNotesWithEscape')) {
      this.settings.set('closeNotesWithEscape', true);
    }

    if (!this.settings.has('fontSizeInNotes')) {
      this.settings.set('fontSizeInNotes', 14);
    }

    if (!this.settings.has('showExactDatesInTheNotesList')) {
      this.settings.set('showExactDatesInTheNotesList', false);
    }
  }
}
