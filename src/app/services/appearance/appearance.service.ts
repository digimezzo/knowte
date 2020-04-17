import { Injectable } from '@angular/core';
import { remote, BrowserWindow } from 'electron';
import { Constants } from '../../core/constants';
import { ColorTheme } from '../../core/color-theme';
import { Logger } from '../../core/logger';
import { OverlayContainer } from '@angular/cdk/overlay';
import { FontSize } from '../../core/font-size';
import { Settings } from '../../core/settings';

@Injectable({
    providedIn: 'root',
})
export class AppearanceService {
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private themeChangedListener: any = this.themeChangedHandler.bind(this);
    private fontSizeChangedListener: any = this.fontSizeChangedHandler.bind(this);
    private _selectedColorTheme: ColorTheme;
    private _selectedFontSize: FontSize;

    constructor(private settings: Settings, private logger: Logger, private overlayContainer: OverlayContainer) {
        this.initialize();
    }

    public get windowHasNativeTitleBar(): boolean {
        const window: BrowserWindow = remote.getCurrentWindow();
        let hasFrame: boolean = false;

        try {
            hasFrame = (window as any).hasFrame;
        } catch (error) {

        }

        return hasFrame;
    }

    public colorThemes: ColorTheme[] = Constants.colorThemes;
    public fontSizes: FontSize[] = Constants.uiFontSizes;

    public get selectedColorTheme(): ColorTheme {
        return this._selectedColorTheme;
    }

    public set selectedColorTheme(v: ColorTheme) {
        this._selectedColorTheme = v;
        this.settings.colorTheme = v.name;

        // Global event because all windows need to be notified
        this.globalEmitter.emit(Constants.themeChangedEvent, v);
    }

    public get selectedFontSize(): FontSize {
        return this._selectedFontSize;
    }

    public set selectedFontSize(v: FontSize) {
        this._selectedFontSize = v;
        this.settings.fontSize = v.normalSize;

        // Global event because all windows need to be notified
        this.globalEmitter.emit(Constants.uiFontSizeChangedEvent, v);
    }

    public themeChangedHandler(colorTheme: ColorTheme): void {
        const colorThemeName: string = colorTheme.name;

        // Apply theme to components in the overlay container: https://gist.github.com/tomastrajan/ee29cd8e180b14ce9bc120e2f7435db7
        const overlayContainerClasses: DOMTokenList = this.overlayContainer.getContainerElement().classList;
        const overlayContainerClassesToRemove: string[] = Array.from(overlayContainerClasses)
        .filter((item: string) => item.includes('-theme'));

        if (overlayContainerClassesToRemove.length) {
            overlayContainerClasses.remove(...overlayContainerClassesToRemove);
        }

        overlayContainerClasses.add(colorThemeName);

        // Apply theme to body
        const bodyClasses: DOMTokenList = document.body.classList;
        const bodyClassesToRemove: string[] = Array.from(bodyClasses).filter((item: string) => item.includes('-theme'));

        if (bodyClassesToRemove.length) {
            bodyClasses.remove(...bodyClassesToRemove);
        }

        document.body.classList.add(colorThemeName);

        this.logger.info(`Applied theme '${colorThemeName}'`, 'AppearanceService', 'applyTheme');
    }

    public fontSizeChangedHandler(fontSize: FontSize): void {
        const element = document.documentElement;
        element.style.setProperty('--fontsize-small', fontSize.smallSize + 'px');
        element.style.setProperty('--fontsize-normal', fontSize.normalSize + 'px');
        element.style.setProperty('--fontsize-large', this._selectedFontSize.largeSize + 'px');
        element.style.setProperty('--fontsize-larger', this._selectedFontSize.largerSize + 'px');
    }

    private initialize(): void {
        this._selectedColorTheme = this.colorThemes.find(x => x.name === this.settings.colorTheme);
        this.themeChangedHandler(this._selectedColorTheme);
        this.globalEmitter.on(Constants.themeChangedEvent, this.themeChangedListener);

        this._selectedFontSize = this.fontSizes.find(x => x.normalSize === this.settings.fontSize);
        this.fontSizeChangedHandler(this._selectedFontSize);
        this.globalEmitter.on(Constants.uiFontSizeChangedEvent, this.fontSizeChangedListener);
    }
}
