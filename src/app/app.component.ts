import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { CollectionService } from './services/collection.service';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AppearanceService } from './services/appearance.service';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public electronService: ElectronService, public router: Router, private appearanceService: AppearanceService,
    private translateService: TranslateService, private collectionService: CollectionService,
    private settingsService: SettingsService, private overlayContainer: OverlayContainer) {

    this.settingsService.initialize();

    this.applyTheme(this.settingsService.theme);

    this.translateService.setDefaultLang(this.settingsService.defaultLanguage);
    this.translateService.use(this.settingsService.language);
  }

  public selectedTheme: string;

  public ngOnDestroy(): void {
  }

  public ngOnInit(): void {
    this.appearanceService.themeChanged$.subscribe((themeName) => this.applyTheme(themeName));

    let showWelcome: boolean = !this.collectionService.hasStorageDirectory;

    if (showWelcome) {
      this.router.navigate(['/welcome']);
    }
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
}
