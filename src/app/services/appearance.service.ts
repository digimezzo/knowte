import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { SettingsService } from './settings.service';

@Injectable({
    providedIn: 'root',
})
export class AppearanceService {
    private themeChanged = new Subject<string>();

    constructor(private settingsService: SettingsService) { }

    public themeChanged$: Observable<string> = this.themeChanged.asObservable();

    public setTheme(themeName: string): void {
        this.settingsService.theme = themeName;
        this.themeChanged.next(themeName);
    }
}