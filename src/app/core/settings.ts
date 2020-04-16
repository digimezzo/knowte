import { Injectable } from '@angular/core';
import * as Store from 'electron-store';
import { Constants } from '../core/constants';
import { remote } from 'electron';

@Injectable({
    providedIn: 'root',
})
export class Settings {
    private settings: Store = new Store();
    private globalEmitter: any = remote.getGlobal('globalEmitter');

    constructor() {
        this.initialize();
    }

     // Default language
     public get defaultLanguage(): string {
        return 'en';
    }

    // Language
    public get language(): string {
        return this.settings.get('language');
    }

    public set language(v: string) {
        this.settings.set('language', v);
    }

    // Native title bar
    public get useNativeTitleBar(): boolean {
        return this.settings.get('useNativeTitleBar');
    }

    public set useNativeTitleBar(v: boolean) {
        this.settings.set('useNativeTitleBar', v);
    }

    // FontSize
    public get fontSize(): number {
        return this.settings.get('fontSize');
    }

    public set fontSize(v: number) {
        this.settings.set('fontSize', v);
    }

    // Color theme
    public get colorTheme(): string {
        return this.settings.get('colorTheme');
    }

    public set colorTheme(v: string) {
        this.settings.set('colorTheme', v);
    }

    // Close notes with escape
    public get closeNotesWithEscape(): boolean {
        return this.settings.get('closeNotesWithEscape');
    }

    public set closeNotesWithEscape(v: boolean) {
        this.settings.set('closeNotesWithEscape', v);
    }

    // Font size in notes
    public get fontSizeInNotes(): number {
        return this.settings.get('fontSizeInNotes');
    }

    public set fontSizeInNotes(v: number) {
        this.settings.set('fontSizeInNotes', v);
        this.globalEmitter.emit(Constants.noteFontSizeChangedEvent);
    }

    // Show exact dates in the notes list
    public get showExactDatesInTheNotesList(): boolean {
        return this.settings.get('showExactDatesInTheNotesList');
    }

    public set showExactDatesInTheNotesList(v: boolean) {
        this.settings.set('showExactDatesInTheNotesList', v);
    }

    // Storage directory
    public get storageDirectory(): string {
        return this.settings.get('storageDirectory');
    }

    public set storageDirectory(v: string) {
        this.settings.set('storageDirectory', v);
    }

    // Active collection
    public get activeCollection(): string {
        return this.settings.get('activeCollection');
    }

    public set activeCollection(v: string) {
        this.settings.set('activeCollection', v);
    }

    private initialize(): void {
        // storageDirectory and activeCollection cannot be initialized here.
        // Their value is set later, depending on user action.

        if (!this.settings.has('language')) {
            this.settings.set('language', 'en');
        }

        if (!this.settings.has('useNativeTitleBar')) {
            this.settings.set('useNativeTitleBar', false);
        }

        if (!this.settings.has('fontSize')) {
            this.settings.set('fontSize', 13);
        }

        if (!this.settings.has('colorTheme')) {
            this.settings.set('colorTheme', 'default-blue-theme');
        } else {
            const settingsColorThemeName: string = this.settings.get('colorTheme');

            // Check if the color theme which is saved in the settings still exists
            // in the app (The color themes might change between releases).
            // If not, reset the color theme setting to the default color theme.
            if (!Constants.colorThemes.map(x => x.name).includes(settingsColorThemeName)) {
                this.settings.set('colorTheme', 'default-blue-theme');
            }
        }

        if (!this.settings.has('closeNotesWithEscape')) {
            this.settings.set('closeNotesWithEscape', true);
        }

        if (!this.settings.has('fontSizeInNotes')) {
            this.settings.set('fontSizeInNotes', 13);
        }

        if (!this.settings.has('showExactDatesInTheNotesList')) {
            this.settings.set('showExactDatesInTheNotesList', false);
        }
    }
}
