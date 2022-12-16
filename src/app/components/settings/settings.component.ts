import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BaseSettings } from '../../core/base-settings';
import { Constants } from '../../core/constants';
import { AppearanceService } from '../../services/appearance/appearance.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { ImportFromOldVersionDialogComponent } from '../dialogs/import-from-old-version-dialog/import-from-old-version-dialog.component';
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
        public translator: TranslatorService,
        public appearance: AppearanceService,
        private settings: BaseSettings,
        private router: Router
    ) {}

    public isBusy: boolean = false;
    public selectedIndex: number;
    public fontSizes: number[] = Constants.noteFontSizes;

    public get closeNotesWithEscapeChecked(): boolean {
        return this.settings.closeNotesWithEscape;
    }
    public set closeNotesWithEscapeChecked(v: boolean) {
        this.settings.closeNotesWithEscape = v;
    }

    public get selectedFontSize(): number {
        return this.settings.fontSizeInNotes;
    }
    public set selectedFontSize(v: number) {
        this.settings.fontSizeInNotes = v;
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

    public get useLightHeaderBarChecked(): boolean {
        return this.settings.useLightHeaderBar;
    }
    public set useLightHeaderBarChecked(v: boolean) {
        this.settings.useLightHeaderBar = v;
        this.appearance.onThemeChanged();
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

    public ngOnInit(): void {}

    public import(): void {
        const dialogRef: MatDialogRef<ImportFromOldVersionDialogComponent> = this.dialog.open(ImportFromOldVersionDialogComponent, {
            width: '450px',
        });
    }

    public setSpellCheckerLanguages(): void {
        const dialogRef: MatDialogRef<SetSpellCheckerLanguagesDialogComponent> = this.dialog.open(SetSpellCheckerLanguagesDialogComponent, {
            width: '450px',
        });
    }

    public goBackToCollection(): void {
        this.router.navigate(['/collection']);
    }
}
