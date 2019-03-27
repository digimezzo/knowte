import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { CollectionService } from './services/collection.service';
import log from 'electron-log';
import { Router } from '@angular/router';
import * as Store from 'electron-store';
import { Utils } from './core/utils';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public electronService: ElectronService, public router: Router,
    private translateService: TranslateService, private collectionService: CollectionService, private overlayContainer: OverlayContainer) {

    this.initializeSettings();
    this.testAsync();

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

  public selectedTheme: string;

  private settings: Store = new Store();

  ngOnInit() {
    let showWelcome: boolean = !this.collectionService.hasStorageDirectory;

    if (showWelcome) {
      this.router.navigate(['/welcome']);
    }
  }

  ngOnDestroy() {
  }

  private async testAsync(): Promise<void> {
    this.selectedTheme = "pink-theme";
    // https://gist.github.com/tomastrajan/ee29cd8e180b14ce9bc120e2f7435db7
    let overlayContainerClasses = this.overlayContainer.getContainerElement().classList;
    let themeClassesToRemove = Array.from(overlayContainerClasses).filter((item: string) => item.includes('-theme'));
    if (themeClassesToRemove.length) {
      overlayContainerClasses.remove(...themeClassesToRemove);
    }
    overlayContainerClasses.add(this.selectedTheme);

    await Utils.sleep(5000);

    this.selectedTheme = "deep-orange-theme";

    overlayContainerClasses = this.overlayContainer.getContainerElement().classList;
    themeClassesToRemove = Array.from(overlayContainerClasses).filter((item: string) => item.includes('-theme'));
    if (themeClassesToRemove.length) {
      overlayContainerClasses.remove(...themeClassesToRemove);
    }
    overlayContainerClasses.add(this.selectedTheme);
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
