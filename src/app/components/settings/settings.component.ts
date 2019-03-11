import { Component, OnInit } from '@angular/core';
import log from 'electron-log';
import { MatDialogRef, MatDialog } from '@angular/material';
import { ImportFromOldVersionDialogComponent } from '../dialogs/importFromOldVersionDialog/importFromOldVersionDialog.component';

@Component({
  selector: 'settings-page',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  public import(): void {
    let dialogRef: MatDialogRef<ImportFromOldVersionDialogComponent> = this.dialog.open(ImportFromOldVersionDialogComponent, {
      width: '450px'
    });
  }
}
