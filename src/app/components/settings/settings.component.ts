import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { ImportFromOldVersionDialogComponent } from '../dialogs/importFromOldVersionDialog/importFromOldVersionDialog.component';
import * as Store from 'electron-store';
import { Language } from '../../core/language';
import { Constants } from '../../core/constants';
import { TranslateService } from '@ngx-translate/core';
import { AppearanceService } from '../../services/appearance.service';
import { Theme } from '../../core/theme';

@Component({
  selector: 'settings-page',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  private settings: Store = new Store();

  constructor(private dialog: MatDialog, private translateService: TranslateService, private appearanceService: AppearanceService) {
  }

  public languages: Language[] = Constants.languages;
  public themes: Theme[] = Constants.themes;
  public fontSizes: number[] = [14, 16, 18, 20, 22, 24];

  public get selectedLanguage(): Language {
    let languageCode: string = this.settings.get('language');
    return this.languages.find(x => x.code === languageCode);
  }
  public set selectedLanguage(v: Language) {
    this.settings.set('language', v.code);
    this.translateService.use(v.code);
  }

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

  public ngOnInit(): void {
  }

  public import(): void {
    let dialogRef: MatDialogRef<ImportFromOldVersionDialogComponent> = this.dialog.open(ImportFromOldVersionDialogComponent, {
      width: '450px'
    });
  }

  public setTheme(themeName: string): void {
    this.appearanceService.setTheme(themeName);
  }
}
