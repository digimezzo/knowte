import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { remote } from 'electron';
import { Constants } from '../core/constants';

@Injectable({
    providedIn: 'root',
})
export class AppearanceService {
    private globalEmitter = remote.getGlobal('globalEmitter');

    constructor(private settingsService: SettingsService) { }

    public setTheme(themeName: string): void {
        this.settingsService.theme = themeName;

        // Global event because all windows need to be notified
        this.globalEmitter.emit(Constants.themeChangedEvent, themeName);
    }
}