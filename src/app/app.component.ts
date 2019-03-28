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
import { AppearanceService } from './services/appearance.service';
import { Constants } from './core/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public electronService: ElectronService, public router: Router, private appearanceService: AppearanceService,
    private translateService: TranslateService, private collectionService: CollectionService, private overlayContainer: OverlayContainer) {

    this.initializeSettings();

    this.applyTheme(this.settings.get('theme'));

    this.translateService.setDefaultLang('en');
    this.translateService.use(this.settings.get('language'));
  }

  public selectedTheme: string;

  private settings: Store = new Store();

  ngOnInit() {
    this.appearanceService.themeChanged$.subscribe((themeName) => this.applyTheme(themeName));

    let showWelcome: boolean = !this.collectionService.hasStorageDirectory;

    if (showWelcome) {
      this.router.navigate(['/welcome']);
    }
  }

  ngOnDestroy() {
  }

  private applyTheme(themeName: string): void {
    // Apply theme to app container
    this.selectedTheme = themeName;

    // Apply theme to components in the overlay container
    // https://gist.github.com/tomastrajan/ee29cd8e180b14ce9bc120e2f7435db7
    let overlayContainerClasses: DOMTokenList = this.overlayContainer.getContainerElement().classList;
    let themeClassesToRemove: string[] = Array.from(overlayContainerClasses).filter((item: string) => item.includes('-theme'));

    if (themeClassesToRemove.length) {
      overlayContainerClasses.remove(...themeClassesToRemove);
    }

    overlayContainerClasses.add(themeName);
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

    if (!this.settings.has('theme')) {
      this.settings.set('theme', "default-theme");
    } else {
      let settingsThemeName: string = this.settings.get('theme');

      // Check if the themes in the settings still exists in the app (The themes might change between releases).
      // If not, reset the settings to the default theme.
      if (!Constants.themes.map(x => x.name).includes(settingsThemeName)) {
        this.settings.set('theme', "default-theme");
      }
    }
  }
}
