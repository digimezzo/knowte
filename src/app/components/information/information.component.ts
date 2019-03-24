import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Constants } from '../../core/constants';
import { LicenseDialogComponent } from '../dialogs/licenseDialog/licenseDialog.component';
import log from 'electron-log';

@Component({
  selector: 'information-page',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {
  constructor(private dialog: MatDialog) {
  }

  public applicationVersion: string = Constants.applicationVersion;
  public applicationCopyright: string = Constants.applicationCopyright;
  public websiteUrl: string = Constants.websiteUrl;
  public twitterUrl: string = Constants.twitterUrl;
  public githubUrl: string  = Constants.githubUrl;
  public externalComponents: any[] = Constants.externalComponents;

  ngOnInit() {
  }

  openLicenseDialog(): void {
    let dialogRef: MatDialogRef<LicenseDialogComponent> = this.dialog.open(LicenseDialogComponent, {
      width: '450px'
    });
  }

  openDonateLink(): void {
    require('electron').shell.openExternal(Constants.donateUrl);
  }
}
