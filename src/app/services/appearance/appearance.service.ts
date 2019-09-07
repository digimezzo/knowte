import { Injectable } from '@angular/core';
import { remote } from 'electron';
import { Constants } from '../../core/constants';
import { Settings } from '../../core/settings';

@Injectable({
    providedIn: 'root',
})
export class AppearanceService {
    private globalEmitter = remote.getGlobal('globalEmitter');

    constructor(private settings: Settings) { }

    public setTheme(themeName: string): void {
        this.settings.theme = themeName;

        // Global event because all windows need to be notified
        this.globalEmitter.emit(Constants.themeChangedEvent, themeName);
    }
}