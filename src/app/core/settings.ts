import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import * as Store from 'electron-store';
import * as os from 'os';
import { Constants } from '../core/constants';
import { BaseSettings } from './base-settings';

@Injectable()
export class Settings implements BaseSettings {
    private settings: Store<any> = new Store();
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

    // Check for updates
    public get checkForUpdates(): boolean {
        return this.settings.get('checkForUpdates');
    }

    public set checkForUpdates(v: boolean) {
        this.settings.set('checkForUpdates', v);
    }

    // Use custom title bar
    public get useCustomTitleBar(): boolean {
        return this.settings.get('useCustomTitleBar');
    }

    public set useCustomTitleBar(v: boolean) {
        this.settings.set('useCustomTitleBar', v);
    }

    // FontSize
    public get fontSize(): number {
        return this.settings.get('fontSize');
    }

    public set fontSize(v: number) {
        this.settings.set('fontSize', v);
    }

    // Color theme
    public get colorScheme(): string {
        return this.settings.get('colorScheme');
    }

    public set colorScheme(v: string) {
        this.settings.set('colorScheme', v);
    }

    // Close notes with escape
    public get closeNotesWithEscape(): boolean {
        return this.settings.get('closeNotesWithEscape');
    }

    public set closeNotesWithEscape(v: boolean) {
        this.settings.set('closeNotesWithEscape', v);
    }

    // Note zoom percentage
    public get noteZoomPercentage(): number {
        return this.settings.get('noteZoomPercentage');
    }

    public set noteZoomPercentage(v: number) {
        this.settings.set('noteZoomPercentage', v);
        this.globalEmitter.emit(Constants.noteZoomPercentageChangedEvent);
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

    // Active collection
    public get notebooksPaneWidth(): number {
        return this.settings.get('notebooksPaneWidth');
    }

    public set notebooksPaneWidth(v: number) {
        this.settings.set('notebooksPaneWidth', v);
    }

    // Move deleted notes to trash
    public get moveDeletedNotesToTrash(): boolean {
        return this.settings.get('moveDeletedNotesToTrash');
    }

    public set moveDeletedNotesToTrash(v: boolean) {
        this.settings.set('moveDeletedNotesToTrash', v);
    }

    // Use light header bar
    public get useLightHeaderBar(): boolean {
        return this.settings.get('useLightHeaderBar');
    }

    public set useLightHeaderBar(v: boolean) {
        this.settings.set('useLightHeaderBar', v);
    }

    // Enable spell checker
    public get enableSpellChecker(): boolean {
        return this.settings.get('enableSpellChecker');
    }

    public set enableSpellChecker(v: boolean) {
        this.settings.set('enableSpellChecker', v);
    }

    // Active spell check languages
    public get activeSpellCheckLanguages(): string {
        return this.settings.get('activeSpellCheckLanguages');
    }

    public set activeSpellCheckLanguages(v: string) {
        this.settings.set('activeSpellCheckLanguages', v);
    }

    private initialize(): void {
        // storageDirectory and activeCollection cannot be initialized here.
        // Their value is set later, depending on user action.

        if (!this.settings.has('language')) {
            this.settings.set('language', 'en');
        }

        if (!this.settings.has('checkForUpdates')) {
            this.settings.set('checkForUpdates', true);
        }

        if (!this.settings.has('useCustomTitleBar')) {
            if (os.platform() === 'win32') {
                this.settings.set('useCustomTitleBar', true);
            } else {
                this.settings.set('useCustomTitleBar', false);
            }
        }

        if (!this.settings.has('fontSize')) {
            this.settings.set('fontSize', 13);
        }

        if (!this.settings.has('colorScheme')) {
            this.settings.set('colorScheme', 'Knowte blue');
        } else {
            const settingsColorSchemeName: string = this.settings.get('colorScheme');

            // Check if the color theme which is saved in the settings still exists
            // in the app (The color themes might change between releases).
            // If not, reset the color theme setting to the default color theme.
            if (!Constants.colorSchemes.map((x) => x.name).includes(settingsColorSchemeName)) {
                this.settings.set('colorScheme', 'Knowte blue');
            }
        }

        if (!this.settings.has('closeNotesWithEscape')) {
            this.settings.set('closeNotesWithEscape', true);
        }

        if (!this.settings.has('noteZoomPercentage')) {
            this.settings.set('noteZoomPercentage', 100);
        }

        if (!this.settings.has('showExactDatesInTheNotesList')) {
            this.settings.set('showExactDatesInTheNotesList', false);
        }

        if (!this.settings.has('notebooksPaneWidth')) {
            this.settings.set('notebooksPaneWidth', 300);
        }

        if (!this.settings.has('moveDeletedNotesToTrash')) {
            this.settings.set('moveDeletedNotesToTrash', true);
        }

        if (!this.settings.has('useLightHeaderBar')) {
            this.settings.set('useLightHeaderBar', false);
        }

        if (!this.settings.has('activeSpellCheckLanguages')) {
            this.settings.set('activeSpellCheckLanguages', '');
        }
    }
}
