import { Injectable, OnDestroy } from '@angular/core';
import * as remote from '@electron/remote';
import { execSync } from 'child_process';
import { ipcRenderer } from 'electron';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class Desktop implements OnDestroy {
    private accentColorChanged: Subject<void> = new Subject();
    private nativeThemeUpdated: Subject<void> = new Subject();
    private readonly accentColorListener = () => this.accentColorChanged.next();
    private readonly nativeThemeListener = () => this.nativeThemeUpdated.next();
    private readonly unloadListener = () => this.dispose();
    private disposed = false;

    constructor() {
        if (remote.systemPreferences != undefined) {
            remote.systemPreferences.on('accent-color-changed', this.accentColorListener);
        }

        if (remote.nativeTheme != undefined) {
            remote.nativeTheme.on('updated', this.nativeThemeListener);
        }

        if (process.platform === 'linux') {
            ipcRenderer.on('linux-accent-color-changed', this.accentColorListener);
        }
        window.addEventListener('unload', this.unloadListener);
    }

    public ngOnDestroy(): void {
        this.dispose();
    }

    private dispose(): void {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        remote.systemPreferences?.removeListener('accent-color-changed', this.accentColorListener);
        remote.nativeTheme?.removeListener('updated', this.nativeThemeListener);
        if (process.platform === 'linux') {
            ipcRenderer.removeListener('linux-accent-color-changed', this.accentColorListener);
        }
        window.removeEventListener('unload', this.unloadListener);
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
        if (process.platform === 'linux') {
            return this.getLinuxAccentColor();
        }

        return remote.systemPreferences.getAccentColor();
    }

    public applicationDataDirectoryPath(): string {
        return remote.app.getPath('userData');
    }

    /**
     * Gets the accent color on Linux via the Freedesktop Portal D-Bus API.
     * Works on GNOME 42+, KDE Plasma 5.25+, and other compliant desktops.
     * Returns the color as a hex string (e.g. "0078d4ff") matching the Electron format.
     */
    private getLinuxAccentColor(): string {
        try {
            const output = execSync(
                'gdbus call --session --dest org.freedesktop.portal.Desktop ' +
                    '--object-path /org/freedesktop/portal/desktop ' +
                    '--method org.freedesktop.portal.Settings.Read ' +
                    'org.freedesktop.appearance accent-color',
                { timeout: 2000, encoding: 'utf-8' },
            );

            return this.parsePortalAccentColor(output);
        } catch {
            return '';
        }
    }

    /**
     * Parses the D-Bus response format: (<<(double, double, double)>>,)
     * e.g. "(<(0.20784313725490197, 0.5176470588235295, 0.8941176470588236)>,)"
     * Returns hex color string like "3584e4ff" (with alpha appended).
     */
    private parsePortalAccentColor(output: string): string {
        const match = output.match(/([\d.]+),\s*([\d.]+),\s*([\d.]+)/);

        if (match == undefined) {
            return '';
        }

        const r = Math.round(parseFloat(match[1]) * 255);
        const g = Math.round(parseFloat(match[2]) * 255);
        const b = Math.round(parseFloat(match[3]) * 255);

        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            return '';
        }

        const toHex = (n: number): string => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');

        return toHex(r) + toHex(g) + toHex(b) + 'ff';
    }
}
