import { Injectable } from '@angular/core';
import * as Store from 'electron-store';
import * as os from 'os';
import { BaseSettings } from './base-settings';

@Injectable()
export class Settings implements BaseSettings {
    private settings: Store<any> = new Store();

    constructor() {
        this.initialize();
    }

    // defaultLanguage
    public get defaultLanguage(): string {
        return 'en';
    }

    // language
    public get language(): string {
        return this.settings.get('language');
    }

    public set language(v: string) {
        this.settings.set('language', v);
    }

    // checkForUpdates
    public get checkForUpdates(): boolean {
        return this.settings.get('checkForUpdates');
    }

    public set checkForUpdates(v: boolean) {
        this.settings.set('checkForUpdates', v);
    }

    // useCustomTitleBar
    public get useCustomTitleBar(): boolean {
        return this.settings.get('useCustomTitleBar');
    }

    public set useCustomTitleBar(v: boolean) {
        this.settings.set('useCustomTitleBar', v);
    }

    // fontSize
    public get fontSize(): number {
        return this.settings.get('fontSize');
    }

    public set fontSize(v: number) {
        this.settings.set('fontSize', v);
    }

    // theme
    public get theme(): string {
        return this.settings.get('theme');
    }

    public set theme(v: string) {
        this.settings.set('theme', v);
    }

    // closeNotesWithEscape
    public get closeNotesWithEscape(): boolean {
        return this.settings.get('closeNotesWithEscape');
    }

    public set closeNotesWithEscape(v: boolean) {
        this.settings.set('closeNotesWithEscape', v);
    }

    // noteZoomPercentage
    public get noteZoomPercentage(): number {
        return this.settings.get('noteZoomPercentage');
    }

    public set noteZoomPercentage(v: number) {
        this.settings.set('noteZoomPercentage', v);
    }

    // showExactDatesInTheNotesList
    public get showExactDatesInTheNotesList(): boolean {
        return this.settings.get('showExactDatesInTheNotesList');
    }

    public set showExactDatesInTheNotesList(v: boolean) {
        this.settings.set('showExactDatesInTheNotesList', v);
    }

    // storageDirectory
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

    // notebooksPaneWidth
    public get notebooksPaneWidth(): number {
        return this.settings.get('notebooksPaneWidth');
    }

    public set notebooksPaneWidth(v: number) {
        this.settings.set('notebooksPaneWidth', v);
    }

    // moveDeletedNotesToTrash
    public get moveDeletedNotesToTrash(): boolean {
        return this.settings.get('moveDeletedNotesToTrash');
    }

    public set moveDeletedNotesToTrash(v: boolean) {
        this.settings.set('moveDeletedNotesToTrash', v);
    }

    // useLightHeaderBar
    public get useLightHeaderBar(): boolean {
        return this.settings.get('useLightHeaderBar');
    }

    public set useLightHeaderBar(v: boolean) {
        this.settings.set('useLightHeaderBar', v);
    }

    // enableSpellChecker
    public get enableSpellChecker(): boolean {
        return this.settings.get('enableSpellChecker');
    }

    public set enableSpellChecker(v: boolean) {
        this.settings.set('enableSpellChecker', v);
    }

    // activeSpellCheckLanguages
    public get activeSpellCheckLanguages(): string {
        return this.settings.get('activeSpellCheckLanguages');
    }

    public set activeSpellCheckLanguages(v: string) {
        this.settings.set('activeSpellCheckLanguages', v);
    }

    // canCreateClassicNotes
    public get canCreateClassicNotes(): boolean {
        return this.settings.get('canCreateClassicNotes');
    }

    public set canCreateClassicNotes(v: boolean) {
        this.settings.set('canCreateClassicNotes', v);
    }

    // canCreateMarkdownNotes
    public get canCreateMarkdownNotes(): boolean {
        return this.settings.get('canCreateMarkdownNotes');
    }

    public set canCreateMarkdownNotes(v: boolean) {
        this.settings.set('canCreateMarkdownNotes', v);
    }

    // followSystemTheme
    public get followSystemTheme(): boolean {
        return this.settings.get('followSystemTheme');
    }

    public set followSystemTheme(v: boolean) {
        this.settings.set('followSystemTheme', v);
    }

    // useLightBackgroundTheme
    public get useLightBackgroundTheme(): boolean {
        return this.settings.get('useLightBackgroundTheme');
    }

    public set useLightBackgroundTheme(v: boolean) {
        this.settings.set('useLightBackgroundTheme', v);
    }

    // followSystemColor
    public get followSystemColor(): boolean {
        return this.settings.get('followSystemColor');
    }

    public set followSystemColor(v: boolean) {
        this.settings.set('followSystemColor', v);
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

        if (!this.settings.has('theme')) {
            this.settings.set('theme', 'Knowte');
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

        if (!this.settings.has('canCreateClassicNotes')) {
            this.settings.set('canCreateClassicNotes', true);
        }

        if (!this.settings.has('canCreateMarkdownNotes')) {
            this.settings.set('canCreateMarkdownNotes', true);
        }

        if (!this.settings.has('followSystemTheme')) {
            this.settings.set('followSystemTheme', false);
        }

        if (!this.settings.has('useLightBackgroundTheme')) {
            this.settings.set('useLightBackgroundTheme', true);
        }

        if (!this.settings.has('followSystemColor')) {
            this.settings.set('followSystemColor', false);
        }
    }
}
