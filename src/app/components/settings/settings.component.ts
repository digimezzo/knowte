import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { ImportFromOldVersionDialogComponent } from '../dialogs/importFromOldVersionDialog/importFromOldVersionDialog.component';
import * as Store from 'electron-store';
import { Language } from '../../core/language';
import { Constants } from '../../core/constants';
import { TranslateService } from '@ngx-translate/core';
import { AppearanceService } from '../../services/appearance.service';
import { Theme } from '../../core/theme';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'settings-page',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  constructor(private dialog: MatDialog, private translateService: TranslateService, private appearanceService: AppearanceService,
    private settingsService: SettingsService) {
  }

  public languages: Language[] = Constants.languages;
  public themes: Theme[] = Constants.themes;
  public fontSizes: number[] = [14, 16, 18, 20, 22, 24];
  public selectedTheme: string;

  public get selectedLanguage(): Language {
    let languageCode: string = this.settingsService.language;
    return this.languages.find(x => x.code === languageCode);
  }
  public set selectedLanguage(v: Language) {
    this.settingsService.language = v.code;
    this.translateService.use(v.code);
  }

  public get closeNotesWithEscapeChecked(): boolean {
    return this.settingsService.closeNotesWithEscape;
  }
  public set closeNotesWithEscapeChecked(v: boolean) {
    this.settingsService.closeNotesWithEscape = v;
  }

  public get selectedFontSize(): number {
    return this.settingsService.fontSizeInNotes;
  }
  public set selectedFontSize(v: number) {
    this.settingsService.fontSizeInNotes = v;
  }

  public get showExactDatesInTheNotesListChecked(): boolean {
    return this.settingsService.showExactDatesInTheNotesList;
  }
  public set showExactDatesInTheNotesListChecked(v: boolean) {
    this.settingsService.showExactDatesInTheNotesList = v;
  }

  public ngOnInit(): void {
    this.selectedTheme = this.settingsService.theme;
  }

  public import(): void {
    let dialogRef: MatDialogRef<ImportFromOldVersionDialogComponent> = this.dialog.open(ImportFromOldVersionDialogComponent, {
      width: '450px'
    });
  }

  public setTheme(themeName: string): void {
    this.selectedTheme = themeName;
    this.appearanceService.setTheme(themeName);
  }
}
