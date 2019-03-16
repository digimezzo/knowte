import { Component, OnInit } from '@angular/core';
import log from 'electron-log';
import { MatDialogRef, MatDialog } from '@angular/material';
import { ImportFromOldVersionDialogComponent } from '../dialogs/importFromOldVersionDialog/importFromOldVersionDialog.component';
import * as Store from 'electron-store';

@Component({
  selector: 'settings-page',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(private dialog: MatDialog) {
  }

  private settings: Store = new Store();

  public fontSizes: number[] = [14, 16, 18, 20, 22, 24];

  public get closeNotesWithEscapeChecked(): boolean {
    return this.settings.get('closeNotesWithEscape');
  }
  public set closeNotesWithEscapeChecked(v: boolean) {
    this.settings.set('closeNotesWithEscape', v);
  }

  public get selectedFontSize(): number {
    return this.settings.get('fontSizeInNotes');
  }
  public set selectedFontSize(v: number) {
    this.settings.set('fontSizeInNotes', v);
  }

  public get showExactDatesInTheNotesListChecked(): boolean {
    return this.settings.get('showExactDatesInTheNotesList');
  }
  public set showExactDatesInTheNotesListChecked(v: boolean) {
    this.settings.set('showExactDatesInTheNotesList', v);
  }

  ngOnInit() {
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

  public import(): void {
    let dialogRef: MatDialogRef<ImportFromOldVersionDialogComponent> = this.dialog.open(ImportFromOldVersionDialogComponent, {
      width: '450px'
    });
  }
}
