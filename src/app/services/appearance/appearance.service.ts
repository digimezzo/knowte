import { Injectable } from '@angular/core';
import { remote } from 'electron';
import { Constants } from '../../core/constants';
import { Settings } from '../../core/settings';
import { ColorTheme } from '../../core/colorTheme';
import { Logger } from '../../core/logger';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable({
    providedIn: 'root',
})
export class AppearanceService {
    private globalEmitter = remote.getGlobal('globalEmitter');
    private themeChangedListener: any = this.applyTheme.bind(this);

    constructor(private settings: Settings, private logger: Logger, private overlayContainer: OverlayContainer) { 
        this.globalEmitter.on(Constants.themeChangedEvent, this.themeChangedListener);
    }
   
    public colorThemes: ColorTheme[] = Constants.colorThemes;
    public selectedTheme: string;

    public setTheme(themeName: string): void {
        this.settings.colorTheme = themeName;

        // Global event because all windows need to be notified
        this.globalEmitter.emit(Constants.themeChangedEvent, themeName);
    }

    public applySettingsTheme(){
        this.applyTheme(this.settings.colorTheme);
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