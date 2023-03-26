import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class Desktop {
    private accentColorChanged: Subject<void> = new Subject();
    private nativeThemeUpdated: Subject<void> = new Subject();

    constructor() {
        if (remote.systemPreferences != undefined) {
            remote.systemPreferences.on('accent-color-changed', () => this.accentColorChanged.next());
        }

        if (remote.nativeTheme != undefined) {
            remote.nativeTheme.on('updated', () => this.nativeThemeUpdated.next());
        }
    }

    public accentColorChanged$: Observable<void> = this.accentColorChanged.asObservable();
    public nativeThemeUpdated$: Observable<void> = this.nativeThemeUpdated.asObservable();

    public openLink(url: string): void {
        remote.shell.openExternal(url);
    }

    public showInFolder(fullPath: string): void {
        remote.shell.showItemInFolder(fullPath);
    }

    public openPath(fullPath: string): void {
        remote.shell.openPath(fullPath);
    }

    public shouldUseDarkColors(): boolean {
        return remote.nativeTheme.shouldUseDarkColors;
    }

    public getAccentColor(): string {
        return remote.systemPreferences.getAccentColor();
    }

    public applicationDataDirectoryPath(): string {
        return remote.app.getPath('userData');
    }
}
