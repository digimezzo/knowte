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

  public get closeNotesWithEscapeChecked(): boolean {
    return this.settings.get('closeNotesWithEscape');
  }
  public set closeNotesWithEscapeChecked(v: boolean) {
    this.settings.set('closeNotesWithEscape', v);
  }


  ngOnInit() {
    if (!this.settings.has('closeNotesWithEscape')) {
      this.settings.set('closeNotesWithEscape', true);
    }
  }

  public import(): void {
    let dialogRef: MatDialogRef<ImportFromOldVersionDialogComponent> = this.dialog.open(ImportFromOldVersionDialogComponent, {
      width: '450px'
    });
  }
}
