import { Injectable } from '@angular/core';
import { remote } from 'electron';
import { Constants } from '../../core/constants';
import { ColorTheme } from '../../core/colorTheme';
import { Logger } from '../../core/logger';
import { OverlayContainer } from '@angular/cdk/overlay';
import { SettingsService } from '../settings/settings.service';

@Injectable({
    providedIn: 'root',
})
export class AppearanceService {
    private globalEmitter = remote.getGlobal('globalEmitter');
    private themeChangedListener: any = this.themeChangedHandler.bind(this);
    private _selectedColorTheme: ColorTheme;

    constructor(private settings: SettingsService, private logger: Logger, private overlayContainer: OverlayContainer) {
        this.initialize();
    }

    public colorThemes: ColorTheme[] = Constants.colorThemes;

    public get selectedColorTheme(): ColorTheme {
        return this._selectedColorTheme;
    }

    public set selectedColorTheme(v: ColorTheme) {
        this._selectedColorTheme = v;
        this.settings.colorTheme = v.name;

        // Global event because all windows need to be notified
        this.globalEmitter.emit(Constants.themeChangedEvent, v);
    }

    public themeChangedHandler(colorTheme: ColorTheme): void {
        let colorThemeName: string = colorTheme.name;

        // Apply theme to components in the overlay container: https://gist.github.com/tomastrajan/ee29cd8e180b14ce9bc120e2f7435db7
        let overlayContainerClasses: DOMTokenList = this.overlayContainer.getContainerElement().classList;
        let overlayContainerClassesToRemove: string[] = Array.from(overlayContainerClasses).filter((item: string) => item.includes('-theme'));

        if (overlayContainerClassesToRemove.length) {
            overlayContainerClasses.remove(...overlayContainerClassesToRemove);
        }

        overlayContainerClasses.add(colorThemeName);

        // Apply theme to body
        let bodyClasses: DOMTokenList = document.body.classList;
        let bodyClassesToRemove: string[] = Array.from(bodyClasses).filter((item: string) => item.includes('-theme'));

        if (bodyClassesToRemove.length) {
            bodyClasses.remove(...bodyClassesToRemove);
        }

        document.body.classList.add(colorThemeName);

        this.logger.info(`Applied theme '${colorThemeName}'`, "AppearanceService", "applyTheme");
    }

    private initialize(): void {
        this._selectedColorTheme = this.colorThemes.find(x => x.name === this.settings.colorTheme);
        this.themeChangedHandler(this._selectedColorTheme);

        this.globalEmitter.on(Constants.themeChangedEvent, this.themeChangedListener);
    }
}