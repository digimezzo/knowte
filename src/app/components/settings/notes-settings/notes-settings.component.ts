import { Component, ViewEncapsulation } from '@angular/core';
import {BaseSettings} from "../../../common/settings/base-settings";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {
    SetSpellCheckerLanguagesDialogComponent
} from "../../dialogs/set-spell-checker-languages-dialog/set-spell-checker-languages-dialog.component";

@Component({
    selector: 'app-notes-settings',
    host: { style: 'display: block; width: 100%;' },
    templateUrl: './notes-settings.component.html',
    styleUrls: ['./notes-settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NotesSettingsComponent {
    public constructor(
        private dialog: MatDialog,
        public settings: BaseSettings,
    ) {}

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

    public setSpellCheckerLanguages(): void {
        const dialogRef: MatDialogRef<SetSpellCheckerLanguagesDialogComponent> = this.dialog.open(SetSpellCheckerLanguagesDialogComponent, {
            width: '450px',
        });
    }
}
