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
    private themeChangedListener: any = this.themeChangedHandler.bind(this);
    private _selectedColorThemeName: string;

    constructor(private settings: Settings, private logger: Logger, private overlayContainer: OverlayContainer) {
        this.globalEmitter.on(Constants.themeChangedEvent, this.themeChangedListener);

        this._selectedColorThemeName = this.settings.colorTheme;
        this.themeChangedHandler(this.settings.colorTheme);
    }

    public colorThemes: ColorTheme[] = Constants.colorThemes;

    public get selectedColorThemeName(): string {
        return this._selectedColorThemeName;
    }

    public set selectedColorThemeName(v: string) {
        this._selectedColorThemeName = v;
        this.settings.colorTheme = v;

        // Global event because all windows need to be notified
        this.globalEmitter.emit(Constants.themeChangedEvent, v);
    }

    public themeChangedHandler(colorThemeName: string): void {
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
}