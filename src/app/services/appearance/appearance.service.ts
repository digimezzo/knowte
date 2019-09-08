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

    constructor(private settings: Settings, private logger: Logger, private overlayContainer: OverlayContainer) { }

    public colorThemes: ColorTheme[] = Constants.colorThemes;

    public setTheme(themeName: string): void {
        this.settings.colorTheme = themeName;

        // Global event because all windows need to be notified
        this.globalEmitter.emit(Constants.themeChangedEvent, themeName);
    }
}