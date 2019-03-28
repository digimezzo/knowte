import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as Store from 'electron-store';

@Injectable({
    providedIn: 'root',
})
export class AppearanceService {
    constructor() {

    }

    private settings: Store = new Store();

    private themeChanged = new Subject<string>();
    themeChanged$ = this.themeChanged.asObservable();

    public setTheme(themeName: string): void {
        this.settings.set("theme", themeName);
        this.themeChanged.next(themeName);
    }
}