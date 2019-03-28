import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AppearanceService {
    constructor() {

    }

    private themeChanged = new Subject();
    themeChanged$ = this.themeChanged.asObservable();

    public applyTheme(themeName: string): void {
        // TODO
        this.themeChanged.next();
    }
}