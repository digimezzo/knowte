import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { CollectionService } from './services/collection/collection.service';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AppearanceService } from './services/appearance/appearance.service';
import { remote } from 'electron';
import { Constants } from './core/constants';
import { Settings } from './core/settings';
import { TranslatorService } from './services/translator/translator.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private globalEmitter = remote.getGlobal('globalEmitter');
  private themeChangedListener: any = this.applyTheme.bind(this);

  constructor(public electron: ElectronService, public router: Router, private appearance: AppearanceService,
    private translator: TranslatorService, private collection: CollectionService,
    private settings: Settings, private overlayContainer: OverlayContainer) {

    this.applyTheme(this.settings.colorTheme);
    this.translator.applyLanguage();
  }

  public selectedTheme: string;

  public ngOnDestroy(): void {
    this.globalEmitter.on(Constants.themeChangedEvent, this.themeChangedListener);
  }

  public ngOnInit(): void {
    this.globalEmitter.on(Constants.themeChangedEvent, this.themeChangedListener);
    
    let showWelcome: boolean = !this.collection.hasStorageDirectory;

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
