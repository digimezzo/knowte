import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { ImportFromOldVersionDialogComponent } from '../dialogs/import-from-old-version-dialog/import-from-old-version-dialog.component';
import { AppearanceService } from '../../services/appearance/appearance.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { Settings } from '../../core/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  constructor(private dialog: MatDialog, public translator: TranslatorService, public appearance: AppearanceService,
    private settings: Settings) {
  }

  public fontSizes: number[] = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

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

  public ngOnInit(): void {
  }

  public import(): void {
    const dialogRef: MatDialogRef<ImportFromOldVersionDialogComponent> = this.dialog.open(ImportFromOldVersionDialogComponent, {
      width: '450px'
    });
  }
}
