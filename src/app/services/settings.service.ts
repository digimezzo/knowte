import { Injectable } from '@angular/core';
import * as Store from 'electron-store';
import { Constants } from '../core/constants';

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    private settings: Store = new Store();

    constructor() {
    }

    // Default language
    public get defaultLanguage() : string {
        return 'en';
    }

    // language
    public get language() : string {
        return this.settings.get('language');
    }

    public set language(v : string) {
        this.settings.set('language', v);
    }

    // theme
    public get theme() : string {
        return this.settings.get('theme');
    }

    public set theme(v : string) {
        this.settings.set('theme', v);
    }

    // closeNotesWithEscape
    public get closeNotesWithEscape() : boolean {
        return this.settings.get('closeNotesWithEscape');
    }

    public set closeNotesWithEscape(v : boolean) {
        this.settings.set('closeNotesWithEscape', v);
    }

    // fontSizeInNotes
    public get fontSizeInNotes() : number {
        return this.settings.get('fontSizeInNotes');
    }

    public set fontSizeInNotes(v : number) {
        this.settings.set('fontSizeInNotes', v);
    }

    // showExactDatesInTheNotesList
    public get showExactDatesInTheNotesList() : boolean {
        return this.settings.get('showExactDatesInTheNotesList');
    }

    public set showExactDatesInTheNotesList(v : boolean) {
        this.settings.set('showExactDatesInTheNotesList', v);
    }

    // storageDirectory
    public get storageDirectory() : string {
        return this.settings.get('storageDirectory');
    }

    public set storageDirectory(v : string) {
        this.settings.set('storageDirectory', v);
    }

    // activeCollection
    public get activeCollection() : string {
        return this.settings.get('activeCollection');
    }

    public set activeCollection(v : string) {
        this.settings.set('activeCollection', v);
    }

    public initialize(): void {
        // storageDirectory and activeCollection cannot be initialized here.
        // Their value is set later, depending on user action.

        if (!this.settings.has('language')) {
            this.settings.set('language', 'en');
        }

        if (!this.settings.has('theme')) {
            this.settings.set('theme', "default-blue-theme");
        } else {
            let settingsThemeName: string = this.settings.get('theme');

            // Check if the theme which is saved in the settings still exists 
            // in the app (The themes might change between releases).
            // If not, reset the theme setting to the default theme.
            if (!Constants.themes.map(x => x.name).includes(settingsThemeName)) {
                this.settings.set('theme', "default-blue-theme");
            }
        }

        if (!this.settings.has('closeNotesWithEscape')) {
            this.settings.set('closeNotesWithEscape', true);
        }

        if (!this.settings.has('fontSizeInNotes')) {
            this.settings.set('fontSizeInNotes', 14);
        }

        if (!this.settings.has('showExactDatesInTheNotesList')) {
            this.settings.set('showExactDatesInTheNotesList', false);
        }
    }
}