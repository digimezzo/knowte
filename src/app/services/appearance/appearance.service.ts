import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { remote } from 'electron';
import { ColorScheme } from '../../core/color-scheme';
import { Constants } from '../../core/constants';
import { FontSize } from '../../core/font-size';
import { Logger } from '../../core/logger';
import { Settings } from '../../core/settings';
import { Palette } from './palette';

@Injectable({
    providedIn: 'root',
})
export class AppearanceService {
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private windowHasFrame: boolean = remote.getGlobal('windowHasFrame');
    private themeChangedListener: any = this.applyTheme.bind(this);
    private fontSizeChangedListener: any = this.applyFontSize.bind(this);
    private _selectedColorScheme: ColorScheme;
    private _selectedFontSize: FontSize;

    constructor(private settings: Settings, private logger: Logger, private overlayContainer: OverlayContainer) {}

    public get windowHasNativeTitleBar(): boolean {
        return this.windowHasFrame;
    }

    public colorSchemes: ColorScheme[] = Constants.colorSchemes;
    public fontSizes: FontSize[] = Constants.uiFontSizes;

    public get selectedColorScheme(): ColorScheme {
        return this._selectedColorScheme;
    }

    public set selectedColorScheme(v: ColorScheme) {
        this._selectedColorScheme = v;
        this.settings.colorScheme = v.name;

        this.onThemeChanged();
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

    public onThemeChanged(): void {
        // Global event because all windows need to be notified
        this.globalEmitter.emit(
            Constants.themeChangedEvent,
            this.colorSchemes.find((x) => x.name === this.settings.colorScheme)
        );
    }

    private applyTheme(): void {
        const element = document.documentElement;
        const colorSchemeToApply: ColorScheme = this.colorSchemes.find((x) => x.name === this.settings.colorScheme);
        const accentColorToApply: string = colorSchemeToApply.accentColor;

        const palette: Palette = new Palette(accentColorToApply);

        element.style.setProperty('--theme-accent-color', accentColorToApply);

        element.style.setProperty('--theme-accent-color-50', palette.color50);
        element.style.setProperty('--theme-accent-color-100', palette.color100);
        element.style.setProperty('--theme-accent-color-200', palette.color200);
        element.style.setProperty('--theme-accent-color-300', palette.color300);
        element.style.setProperty('--theme-accent-color-400', palette.color400);
        element.style.setProperty('--theme-accent-color-500', palette.color500);
        element.style.setProperty('--theme-accent-color-600', palette.color600);
        element.style.setProperty('--theme-accent-color-700', palette.color700);
        element.style.setProperty('--theme-accent-color-800', palette.color800);
        element.style.setProperty('--theme-accent-color-900', palette.color900);
        element.style.setProperty('--theme-accent-color-A100', palette.colorA100);
        element.style.setProperty('--theme-accent-color-A200', palette.colorA200);
        element.style.setProperty('--theme-accent-color-A400', palette.colorA400);
        element.style.setProperty('--theme-accent-color-A700', palette.colorA700);

        if (this.settings.useLightHeaderBar) {
            element.style.setProperty('--theme-header-background-color', '#ffffff');
            element.style.setProperty('--theme-header-text-color', '#000000');
            element.style.setProperty('--theme-header-border-color', '#dedede');
            element.style.setProperty('--theme-window-button-hover-background', 'rgba(0, 0, 0, 0.1)');
            element.style.setProperty('--theme-soft-text-color', '#666666');
        } else {
            element.style.setProperty('--theme-header-background-color', '#212121');
            element.style.setProperty('--theme-header-text-color', '#ffffff');
            element.style.setProperty('--theme-header-border-color', 'transparent');
            element.style.setProperty('--theme-window-button-hover-background', 'rgba(255, 255, 255, 0.1)');
            element.style.setProperty('--theme-soft-text-color', '#999999');
        }

        this.logger.info(`Applied color scheme '${this.selectedColorScheme.name}'`, 'AppearanceService', 'applyTheme');
    }

    private applyFontSize(fontSize: FontSize): void {
        const element = document.documentElement;
        element.style.setProperty('--fontsize-normal', fontSize.normalSize + 'px');
        element.style.setProperty('--fontsize-large', this._selectedFontSize.largeSize + 'px');
        element.style.setProperty('--fontsize-larger', this._selectedFontSize.largerSize + 'px');
    }

    public initialize(): void {
        this._selectedColorScheme = this.colorSchemes.find((x) => x.name === this.settings.colorScheme);
        this.applyTheme();
        this.globalEmitter.on(Constants.themeChangedEvent, this.themeChangedListener);

        this._selectedFontSize = this.fontSizes.find((x) => x.normalSize === this.settings.fontSize);
        this.applyFontSize(this._selectedFontSize);
        this.globalEmitter.on(Constants.uiFontSizeChangedEvent, this.fontSizeChangedListener);

        const element = document.documentElement;

        if (this.windowHasFrame) {
            element.style.setProperty('--viewport-height-correction', '100px');
            element.style.setProperty('--main-logo-top', '18px');
        } else {
            element.style.setProperty('--viewport-height-correction', '122px');
            element.style.setProperty('--main-logo-top', '40px');
        }
    }
}
