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

    public get selectedColorTheme(): ColorTheme {
        return this.colorThemes.find(x => x.name === this.settings.colorTheme);
    }

    public set selectedColorTheme(v: ColorTheme) {
        this.settings.colorTheme = v.name;

        // Global event because all windows need to be notified
        this.globalEmitter.emit(Constants.themeChangedEvent);
    }

    public applyTheme(): void {
        // let themeNameWithBackground: string = `${this.settings.colorTheme}-${this.settings.useLightBackgroundTheme ? "light" : "dark"}`;
        let themeNameWithBackground: string = this.settings.colorTheme;

        // Apply theme to components in the overlay container: https://gist.github.com/tomastrajan/ee29cd8e180b14ce9bc120e2f7435db7
        let overlayContainerClasses: DOMTokenList = this.overlayContainer.getContainerElement().classList;
        // let overlayContainerClassesToRemove: string[] = Array.from(overlayContainerClasses).filter((item: string) => item.includes('-theme-'));
        let overlayContainerClassesToRemove: string[] = Array.from(overlayContainerClasses).filter((item: string) => item.includes('-theme'));

        if (overlayContainerClassesToRemove.length) {
            overlayContainerClasses.remove(...overlayContainerClassesToRemove);
        }

        overlayContainerClasses.add(themeNameWithBackground);

        // Apply theme to body
        let bodyClasses: DOMTokenList = document.body.classList;
        // let bodyClassesToRemove: string[] = Array.from(bodyClasses).filter((item: string) => item.includes('-theme-'));
        let bodyClassesToRemove: string[] = Array.from(bodyClasses).filter((item: string) => item.includes('-theme'));

        if (bodyClassesToRemove.length) {
            bodyClasses.remove(...bodyClassesToRemove);
        }

        document.body.classList.add(themeNameWithBackground);

        this.logger.info(`Applied theme '${themeNameWithBackground}'`, "AppearanceService", "applyTheme");
    }
}