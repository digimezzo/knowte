import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { Subscription } from 'rxjs';
import { ApplicationPaths } from '../../common/application/applicationPaths';
import { Constants } from '../../common/application/constants';
import { FontSize } from '../../common/application/font-size';
import { BaseApplication } from '../../common/io/base-application';
import { Desktop } from '../../common/io/desktop';
import { DocumentProxy } from '../../common/io/document-proxy';
import { FileAccess } from '../../common/io/file-access';
import { Logger } from '../../common/logging/logger';
import { BaseSettings } from '../../common/settings/base-settings';
import { StringUtils } from '../../common/utils/strings-utils';
import { AppearanceEvents } from './appearance-events';
import { BaseAppearanceService } from './base-appearance.service';
import { ColorConverter } from './color-converter';
import { DefaultThemesCreator } from './default-themes-creator';
import { Palette } from './palette';
import { Theme } from './theme/theme';
import { ThemeNeutralColors } from './theme/theme-neutral-colors';

@Injectable()
export class AppearanceService implements BaseAppearanceService {
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private themeChangedListener: any = this.applyThemeFromGlobalEvent.bind(this);
    private fontSizeChangedListener: any = this.applyFontSizeFromGlobalEvent.bind(this);

    private interval: number;
    private _themes: Theme[] = [];

    private _windowHasNativeTitleBar: boolean;
    private _selectedTheme: Theme;
    private _selectedFontSize: FontSize;
    private subscription: Subscription = new Subscription();

    private _themesDirectoryPath: string;

    constructor(
        private settings: BaseSettings,
        private logger: Logger,
        private overlayContainer: OverlayContainer,
        private application: BaseApplication,
        private fileAccess: FileAccess,
        private desktop: Desktop,
        private defaultThemesCreator: DefaultThemesCreator,
        private documentProxy: DocumentProxy
    ) {
        this.initialize();
    }

    public get windowHasNativeTitleBar(): boolean {
        return this._windowHasNativeTitleBar;
    }

    public get isUsingLightTheme(): boolean {
        return (
            (!this.settings.followSystemTheme && this.settings.useLightBackgroundTheme) ||
            (this.settings.followSystemTheme && !this.isSystemUsingDarkTheme())
        );
    }

    public get followSystemTheme(): boolean {
        return this.settings.followSystemTheme;
    }

    public set followSystemTheme(v: boolean) {
        this.settings.followSystemTheme = v;
        this.safeApplyTheme();
        this.onThemeChanged();
    }

    public get useLightBackgroundTheme(): boolean {
        return this.settings.useLightBackgroundTheme;
    }

    public set useLightBackgroundTheme(v: boolean) {
        this.settings.useLightBackgroundTheme = v;
        this.safeApplyTheme();
        this.onThemeChanged();
    }

    public get followSystemColor(): boolean {
        return this.settings.followSystemColor;
    }

    public set followSystemColor(v: boolean) {
        this.settings.followSystemColor = v;
        this.safeApplyTheme();
        this.onThemeChanged();
    }

    public get themes(): Theme[] {
        return this._themes;
    }

    public set themes(v: Theme[]) {
        this._themes = v;
    }

    public get selectedTheme(): Theme {
        return this._selectedTheme;
    }

    public set selectedTheme(v: Theme) {
        this._selectedTheme = v;
        this.settings.theme = v.name;
        this.safeApplyTheme();
        this.onThemeChanged();
    }

    public fontSizes: FontSize[] = Constants.fontSizes;

    public get selectedFontSize(): FontSize {
        return this._selectedFontSize;
    }

    public set selectedFontSize(v: FontSize) {
        this._selectedFontSize = v;
        this.settings.fontSize = v.normalSize;
        this.applyFontSize();
        this.onFontSizeChanged();
    }

    public get themesDirectoryPath(): string {
        return this._themesDirectoryPath;
    }

    public refreshThemes(): void {
        this.ensureDefaultThemesExist();
        this._themes = this.getThemesFromThemesDirectory();
        this.setSelectedThemeFromSettings();
        this.safeApplyTheme();
    }

    public applyAppearance(): void {
        this.safeApplyTheme();
        this.applyFontSize();
    }

    public startWatchingThemesDirectory(): void {
        this.interval = window.setInterval(() => {
            this.checkIfThemesDirectoryHasChanged();
        }, 2000);
    }

    public stopWatchingThemesDirectory(): void {
        clearInterval(this.interval);
    }

    private onThemeChanged(): void {
        // Global event because all windows need to be notified
        this.globalEmitter.emit(AppearanceEvents.themeChangedEvent, this.settings.theme);
    }

    private onFontSizeChanged(): void {
        // Global event because all windows need to be notified
        this.globalEmitter.emit(AppearanceEvents.fontSizeChangedEvent, this.settings.fontSize);
    }

    private initialize(): void {
        this._windowHasNativeTitleBar = this.application.getGlobal('windowHasFrame');

        this._themesDirectoryPath = this.getThemesDirectoryPath();
        this.ensureThemesDirectoryExists();
        this.ensureDefaultThemesExist();
        this._themes = this.getThemesFromThemesDirectory();
        this.setSelectedThemeFromSettings();

        this.setSelectedFontSizeFromSettings();

        this.addSubscriptions();
    }

    private checkIfThemesDirectoryHasChanged(): void {
        const themeFiles: string[] = this.fileAccess.getFilesInDirectory(this.themesDirectoryPath);
        if (themeFiles.length !== this.themes.length) {
            this.refreshThemes();
        }
    }

    private applyFontSize(): void {
        const element: HTMLElement = this.documentProxy.getDocumentElement();
        element.style.setProperty('--fontsize-normal', this._selectedFontSize.normalSize + 'px');
        element.style.setProperty('--fontsize-status-icon', this._selectedFontSize.normalSize + 2 + 'px');
        element.style.setProperty('--fontsize-large', this._selectedFontSize.largeSize + 'px');
        element.style.setProperty('--fontsize-larger', this._selectedFontSize.largerSize + 'px');
    }

    private addSubscriptions(): void {
        this.subscription.add(
            this.desktop.accentColorChanged$.subscribe(() => {
                this.safeApplyTheme();
            })
        );
        this.subscription.add(
            this.desktop.nativeThemeUpdated$.subscribe(() => {
                this.safeApplyTheme();
            })
        );

        this.globalEmitter.on(AppearanceEvents.themeChangedEvent, this.themeChangedListener);
        this.globalEmitter.on(AppearanceEvents.fontSizeChangedEvent, this.fontSizeChangedListener);
    }

    private applyThemeFromGlobalEvent(themeName: string): void {
        this._selectedTheme = this.themes.find((x) => x.name === themeName);
        this.safeApplyTheme();
    }

    private applyFontSizeFromGlobalEvent(fontSizeNormalSize: number): void {
        this._selectedFontSize = this.fontSizes.find((x) => x.normalSize === fontSizeNormalSize);
        this.applyFontSize();
    }

    private safeApplyTheme(): boolean {
        const selectedThemeName: string = this.selectedTheme.name;

        try {
            this.applyTheme();
        } catch (e) {
            this.selectedTheme.isBroken = true;
            this.settings.theme = 'Dopamine';
            this.setSelectedThemeFromSettings();
            this.applyTheme();
            const fallbackThemeName: string = this.selectedTheme.name;

            this.logger.warn(
                `Could not apply theme '${selectedThemeName}'. Applying theme '${fallbackThemeName}' instead.`,
                'AppearanceService',
                'safeApplyTheme'
            );

            return false;
        }

        return true;
    }

    private applyTheme(): void {
        const element: HTMLElement = this.documentProxy.getDocumentElement();

        // Color
        let primaryColorToApply: string = this.selectedTheme.coreColors.primaryColor;
        let secondaryColorToApply: string = this.selectedTheme.coreColors.secondaryColor;
        let accentColorToApply: string = this.selectedTheme.coreColors.accentColor;

        if (this.settings.followSystemColor) {
            const systemAccentColor: string = this.getSystemAccentColor();

            if (!StringUtils.isNullOrWhiteSpace(systemAccentColor)) {
                primaryColorToApply = systemAccentColor;
                secondaryColorToApply = systemAccentColor;
                accentColorToApply = systemAccentColor;
            }
        }

        const palette: Palette = new Palette(accentColorToApply);

        // Core colors
        element.style.setProperty('--theme-primary-color', primaryColorToApply);
        element.style.setProperty('--theme-secondary-color', secondaryColorToApply);
        element.style.setProperty('--theme-accent-color', accentColorToApply);

        const accentRgbArray: number[] = ColorConverter.stringToRgb(accentColorToApply);
        element.style.setProperty('--theme-rgb-accent', accentRgbArray.join(','));

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

        // Neutral & markdown colors
        let themeName: string = 'default-theme-dark';
        this.applyNeutralColors(element, this.selectedTheme.darkColors);
        this.applyClassicColors(element, this.selectedTheme.darkColors);
        this.applyMarkdownColors(element, this.selectedTheme.darkColors, this.isUsingLightTheme);

        if (this.isUsingLightTheme) {
            themeName = 'default-theme-light';
            this.applyNeutralColors(element, this.selectedTheme.lightColors);
            this.applyClassicColors(element, this.selectedTheme.lightColors);
            this.applyMarkdownColors(element, this.selectedTheme.lightColors, this.isUsingLightTheme);
        }

        // Apply theme to components in the overlay container: https://gist.github.com/tomastrajan/ee29cd8e180b14ce9bc120e2f7435db7
        this.applyThemeClasses(this.overlayContainer.getContainerElement(), themeName);

        // Apply theme to body
        this.applyThemeClasses(this.documentProxy.getBody(), themeName);

        // Apply positions
        if (this.windowHasNativeTitleBar) {
            element.style.setProperty('--viewport-height-correction', '100px');
            element.style.setProperty('--main-logo-top', '18px');
        } else {
            element.style.setProperty('--viewport-height-correction', '122px');
            element.style.setProperty('--main-logo-top', '40px');
        }

        this.logger.info(
            `Applied theme name=${this.selectedTheme.name}' and theme classes='${themeName}'`,
            'AppearanceService',
            'applyTheme'
        );
    }

    private applyNeutralColors(element: HTMLElement, neutralColors: ThemeNeutralColors): void {
        const primaryTextRgbArray: number[] = ColorConverter.stringToRgb(neutralColors.primaryText);

        element.style.setProperty('--theme-rgb-base', primaryTextRgbArray.join(','));

        element.style.setProperty('--theme-background', neutralColors.background);
        element.style.setProperty('--theme-primary-text', neutralColors.primaryText);
        element.style.setProperty('--theme-secondary-text', neutralColors.secondaryText);
        element.style.setProperty('--theme-separator', neutralColors.separator);
        element.style.setProperty('--theme-context-menu-background', neutralColors.contextMenuBackground);
        element.style.setProperty('--theme-context-menu-primary-text', neutralColors.contextMenuPrimaryText);
        element.style.setProperty('--theme-context-menu-secondary-text', neutralColors.contextMenuSecondaryText);
        element.style.setProperty('--theme-context-menu-separator', neutralColors.contextMenuSeparator);
        element.style.setProperty('--theme-hover-background', neutralColors.hoverBackground);
        element.style.setProperty('--theme-selection-background', neutralColors.selectionBackground);
        element.style.setProperty('--theme-primary-button-text', neutralColors.primaryButtonText);
        element.style.setProperty('--theme-secondary-button-background', neutralColors.secondaryButtonBackground);
        element.style.setProperty('--theme-secondary-button-text', neutralColors.secondaryButtonText);
        element.style.setProperty('--theme-editor-background', neutralColors.editorBackground);
        element.style.setProperty('--theme-editor-primary-text', neutralColors.editorPrimaryText);
        element.style.setProperty('--theme-editor-secondary-text', neutralColors.editorSecondaryText);
        element.style.setProperty('--theme-button-border', neutralColors.buttonBorder);
        element.style.setProperty('--theme-highlight-foreground', neutralColors.highlightForeground);
    }

    private setSelectedThemeFromSettings(): void {
        let themeFromSettings: Theme = this.themes.find((x) => x.name === this.settings.theme);

        if (themeFromSettings == undefined) {
            themeFromSettings = this.themes.find((x) => x.name === 'Dopamine');

            if (themeFromSettings == undefined) {
                themeFromSettings = this.themes[0];
            }

            this.logger.info(
                `Theme '${this.settings.theme}' from settings was not found. Applied theme '${themeFromSettings.name}' instead.`,
                'AppearanceService',
                'setSelectedThemeFromSettings'
            );
        }

        this._selectedTheme = themeFromSettings;
    }

    private setSelectedFontSizeFromSettings(): void {
        this._selectedFontSize = this.fontSizes.find((x) => x.normalSize === this.settings.fontSize);
    }

    private isSystemUsingDarkTheme(): boolean {
        let systemIsUsingDarkTheme: boolean = false;

        if (this.settings.followSystemTheme) {
            try {
                systemIsUsingDarkTheme = this.desktop.shouldUseDarkColors();
            } catch (e) {
                this.logger.error(`Could not get system dark mode. Error: ${e.message}`, 'AppearanceService', 'isSystemUsingDarkTheme');
            }
        }

        return systemIsUsingDarkTheme;
    }

    private applyThemeClasses(element: HTMLElement, themeName: string): void {
        const classesToRemove: string[] = Array.from(element.classList).filter((item: string) => item.includes('-theme-'));

        if (classesToRemove != undefined && classesToRemove.length > 0) {
            element.classList.remove(...classesToRemove);
        }

        element.classList.add(themeName);
    }

    private getSystemAccentColor(): string {
        let systemAccentColor: string = '';

        try {
            const systemAccentColorWithTransparency: string = this.desktop.getAccentColor();
            systemAccentColor = '#' + systemAccentColorWithTransparency.substr(0, 6);
        } catch (e) {
            this.logger.error(`Could not get system accent color. Error: ${e.message}`, 'AppearanceService', 'getSystemAccentColor');
        }

        return systemAccentColor;
    }

    private ensureThemesDirectoryExists(): void {
        this.fileAccess.createFullDirectoryPathIfDoesNotExist(this.themesDirectoryPath);
    }

    private ensureDefaultThemesExist(): void {
        const defaultThemes: Theme[] = this.defaultThemesCreator.createAllThemes();

        for (const defaultTheme of defaultThemes) {
            const themeFilePath: string = this.fileAccess.combinePath(this.themesDirectoryPath, `${defaultTheme.name}.theme`);

            // We don't want the isBroken property in the theme files
            const defaultThemeWithoutIsBroken = { ...defaultTheme, isBroken: undefined };
            const stringifiedDefaultTheme: string = JSON.stringify(defaultThemeWithoutIsBroken, undefined, 2);
            this.fileAccess.writeToFile(themeFilePath, stringifiedDefaultTheme);
        }
    }

    private getThemesFromThemesDirectory(): Theme[] {
        const themeFiles: string[] = this.fileAccess.getFilesInDirectory(this.themesDirectoryPath);
        const themes: Theme[] = [];

        for (const themeFile of themeFiles) {
            const themeFileContent: string = this.fileAccess.getFileContentAsString(themeFile);

            try {
                const theme: Theme = JSON.parse(themeFileContent);
                themes.push(theme);
            } catch (e) {
                this.logger.error(`Could not parse theme file. Error: ${e.message}`, 'AppearanceService', 'getThemesFromThemesDirectory');
            }
        }

        return themes;
    }

    private getThemesDirectoryPath(): string {
        const applicationDirectory: string = this.fileAccess.applicationDataDirectory();
        const themesDirectoryPath: string = this.fileAccess.combinePath(applicationDirectory, ApplicationPaths.themesFolder);

        return themesDirectoryPath;
    }

    private applyClassicColors(element: HTMLElement, neutralColors: ThemeNeutralColors) {
        element.style.setProperty('--theme-classic-note-code-background', neutralColors.editorCodeBackground);
        element.style.setProperty('--theme-classic-note-quote-border', neutralColors.editorBorder);
    }

    private applyMarkdownColors(element: HTMLElement, neutralColors: ThemeNeutralColors, isUsingLightTheme: boolean): void {
        if (isUsingLightTheme) {
            element.style.setProperty('--color-prettylights-syntax-comment', '#6e7781');
            element.style.setProperty('--color-prettylights-syntax-constant', '#0550ae');
            element.style.setProperty('--color-prettylights-syntax-entity', '#8250df');
            element.style.setProperty('--color-prettylights-syntax-storage-modifier-import', '#24292f');
            element.style.setProperty('--color-prettylights-syntax-entity-tag', '#116329');
            element.style.setProperty('--color-prettylights-syntax-keyword', '#cf222e');
            element.style.setProperty('--color-prettylights-syntax-string', '#0a3069');
            element.style.setProperty('--color-prettylights-syntax-variable', '#953800');
            element.style.setProperty('--color-prettylights-syntax-brackethighlighter-unmatched', '#82071e');
            element.style.setProperty('--color-prettylights-syntax-invalid-illegal-text', '#f6f8fa');
            element.style.setProperty('--color-prettylights-syntax-invalid-illegal-bg', '#82071e');
            element.style.setProperty('--color-prettylights-syntax-carriage-return-text', '#f6f8fa');
            element.style.setProperty('--color-prettylights-syntax-carriage-return-bg', '#cf222e');
            element.style.setProperty('--color-prettylights-syntax-string-regexp', '#116329');
            element.style.setProperty('--color-prettylights-syntax-markup-list', '#3b2300');
            element.style.setProperty('--color-prettylights-syntax-markup-heading', '#0550ae');
            element.style.setProperty('--color-prettylights-syntax-markup-italic', '#24292f');
            element.style.setProperty('--color-prettylights-syntax-markup-bold', '#24292f');
            element.style.setProperty('--color-prettylights-syntax-markup-deleted-text', '#82071e');
            element.style.setProperty('--color-prettylights-syntax-markup-deleted-bg', '#ffebe9');
            element.style.setProperty('--color-prettylights-syntax-markup-inserted-text', '#116329');
            element.style.setProperty('--color-prettylights-syntax-markup-inserted-bg', '#dafbe1');
            element.style.setProperty('--color-prettylights-syntax-markup-changed-text', '#953800');
            element.style.setProperty('--color-prettylights-syntax-markup-changed-bg', '#ffd8b5');
            element.style.setProperty('--color-prettylights-syntax-markup-ignored-text', '#eaeef2');
            element.style.setProperty('--color-prettylights-syntax-markup-ignored-bg', '#0550ae');
            element.style.setProperty('--color-prettylights-syntax-meta-diff-range', '#8250df');
            element.style.setProperty('--color-prettylights-syntax-brackethighlighter-angle', '#57606a');
            element.style.setProperty('--color-prettylights-syntax-sublimelinter-gutter-mark', '#8c959f');
            element.style.setProperty('--color-prettylights-syntax-constant-other-reference-link', '#0a3069');
            element.style.setProperty('--color-fg-default', '#24292f');
            element.style.setProperty('--color-fg-muted', '#57606a');
            element.style.setProperty('--color-fg-subtle', '#6e7781');
            element.style.setProperty('--color-canvas-default', neutralColors.editorBackground);
            element.style.setProperty('--color-canvas-subtle', neutralColors.editorCodeBackground);
            element.style.setProperty('--color-border-default', neutralColors.editorBorder);
            element.style.setProperty('--color-border-muted', neutralColors.editorBorder);
            element.style.setProperty('--color-neutral-muted', neutralColors.editorCodeBackground);
            element.style.setProperty('--color-accent-fg', '#0969da');
            element.style.setProperty('--color-accent-emphasis', '#0969da');
            element.style.setProperty('--color-attention-subtle', '#fff8c5');
            element.style.setProperty('--color-danger-fg', '#cf222e');
        } else {
            element.style.setProperty('--color-prettylights-syntax-comment', '#8b949e');
            element.style.setProperty('--color-prettylights-syntax-constant', '#79c0ff');
            element.style.setProperty('--color-prettylights-syntax-entity', '#d2a8ff');
            element.style.setProperty('--color-prettylights-syntax-storage-modifier-import', '#c9d1d9');
            element.style.setProperty('--color-prettylights-syntax-entity-tag', '#7ee787');
            element.style.setProperty('--color-prettylights-syntax-keyword', '#ff7b72');
            element.style.setProperty('--color-prettylights-syntax-string', '#a5d6ff');
            element.style.setProperty('--color-prettylights-syntax-variable', '#ffa657');
            element.style.setProperty('--color-prettylights-syntax-brackethighlighter-unmatched', '#f85149');
            element.style.setProperty('--color-prettylights-syntax-invalid-illegal-text', '#f0f6fc');
            element.style.setProperty('--color-prettylights-syntax-invalid-illegal-bg', '#8e1519');
            element.style.setProperty('--color-prettylights-syntax-carriage-return-text', '#f0f6fc');
            element.style.setProperty('--color-prettylights-syntax-carriage-return-bg', '#b62324');
            element.style.setProperty('--color-prettylights-syntax-string-regexp', '#7ee787');
            element.style.setProperty('--color-prettylights-syntax-markup-list', '#f2cc60');
            element.style.setProperty('--color-prettylights-syntax-markup-heading', '#1f6feb');
            element.style.setProperty('--color-prettylights-syntax-markup-italic', '#c9d1d9');
            element.style.setProperty('--color-prettylights-syntax-markup-bold', '#c9d1d9');
            element.style.setProperty('--color-prettylights-syntax-markup-deleted-text', '#ffdcd7');
            element.style.setProperty('--color-prettylights-syntax-markup-deleted-bg', '#67060c');
            element.style.setProperty('--color-prettylights-syntax-markup-inserted-text', '#aff5b4');
            element.style.setProperty('--color-prettylights-syntax-markup-inserted-bg', '#033a16');
            element.style.setProperty('--color-prettylights-syntax-markup-changed-text', '#ffdfb6');
            element.style.setProperty('--color-prettylights-syntax-markup-changed-bg', '#5a1e02');
            element.style.setProperty('--color-prettylights-syntax-markup-ignored-text', '#c9d1d9');
            element.style.setProperty('--color-prettylights-syntax-markup-ignored-bg', '#1158c7');
            element.style.setProperty('--color-prettylights-syntax-meta-diff-range', '#d2a8ff');
            element.style.setProperty('--color-prettylights-syntax-brackethighlighter-angle', '#8b949e');
            element.style.setProperty('--color-prettylights-syntax-sublimelinter-gutter-mark', '#484f58');
            element.style.setProperty('--color-prettylights-syntax-constant-other-reference-link', '#a5d6ff');
            element.style.setProperty('--color-fg-default', '#c9d1d9');
            element.style.setProperty('--color-fg-muted', '#8b949e');
            element.style.setProperty('--color-fg-subtle', '#6e7681');
            element.style.setProperty('--color-canvas-default', neutralColors.editorBackground);
            element.style.setProperty('--color-canvas-subtle', neutralColors.editorCodeBackground);
            element.style.setProperty('--color-border-default', neutralColors.editorBorder);
            element.style.setProperty('--color-border-muted', neutralColors.editorBorder);
            element.style.setProperty('--color-neutral-muted', neutralColors.editorCodeBackground);
            element.style.setProperty('--color-accent-fg', '#58a6ff');
            element.style.setProperty('--color-accent-emphasis', '#1f6feb');
            element.style.setProperty('--color-attention-subtle', ' rgba(187, 128, 9, 0.15)');
            element.style.setProperty('--color-danger-fg', '#f85149');
        }
    }
}
