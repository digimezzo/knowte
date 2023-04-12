import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Desktop } from '../../common/io/desktop';
import { BaseSettings } from '../../common/settings/base-settings';
import { BaseAppearanceService } from '../../services/appearance/base-appearance.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { SetSpellCheckerLanguagesDialogComponent } from '../dialogs/set-spell-checker-languages-dialog/set-spell-checker-languages-dialog.component';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent implements OnInit {
    constructor(
        private dialog: MatDialog,
        private desktop: Desktop,
        public translator: TranslatorService,
        public appearance: BaseAppearanceService,
        public settings: BaseSettings,
        private router: Router
    ) {}

    public isBusy: boolean = false;
    public selectedIndex: number;

    public get closeNotesWithEscapeChecked(): boolean {
        return this.settings.closeNotesWithEscape;
    }
    public set closeNotesWithEscapeChecked(v: boolean) {
        this.settings.closeNotesWithEscape = v;
    }

    public get showExactDatesInTheNotesListChecked(): boolean {
        return this.settings.showExactDatesInTheNotesList;
    }
    public set showExactDatesInTheNotesListChecked(v: boolean) {
        this.settings.showExactDatesInTheNotesList = v;
    }

    public get useCustomTitleBarChecked(): boolean {
        return this.settings.useCustomTitleBar;
    }
    public set useCustomTitleBarChecked(v: boolean) {
        this.settings.useCustomTitleBar = v;
    }

    public get checkForUpdatesChecked(): boolean {
        return this.settings.checkForUpdates;
    }
    public set checkForUpdatesChecked(v: boolean) {
        this.settings.checkForUpdates = v;
    }

    public get moveDeletedNotesToTrashChecked(): boolean {
        return this.settings.moveDeletedNotesToTrash;
    }
    public set moveDeletedNotesToTrashChecked(v: boolean) {
        this.settings.moveDeletedNotesToTrash = v;
    }

    public get enableSpellCheckerChecked(): boolean {
        return this.settings.enableSpellChecker;
    }
    public set enableSpellCheckerChecked(v: boolean) {
        this.settings.enableSpellChecker = v;
    }

    public get classicNoteChecked(): boolean {
        return this.settings.canCreateClassicNotes;
    }
    public set classicNoteChecked(v: boolean) {
        if (!v && !this.markdownNoteChecked) {
            this.markdownNoteChecked = true;
        }

        this.settings.canCreateClassicNotes = v;
    }

    public get markdownNoteChecked(): boolean {
        return this.settings.canCreateMarkdownNotes;
    }
    public set markdownNoteChecked(v: boolean) {
        if (!v && !this.classicNoteChecked) {
            this.classicNoteChecked = true;
        }

        this.settings.canCreateMarkdownNotes = v;
    }

    public ngOnInit(): void {}

    public setSpellCheckerLanguages(): void {
        const dialogRef: MatDialogRef<SetSpellCheckerLanguagesDialogComponent> = this.dialog.open(SetSpellCheckerLanguagesDialogComponent, {
            width: '450px',
        });
    }

    public goBackToCollection(): void {
        this.router.navigate(['/collection']);
    }

    public openThemesDirectory(): void {
        this.desktop.openPath(this.appearance.themesDirectoryPath);
    }
}
