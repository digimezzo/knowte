import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Constants } from '../../core/constants';
import { LicenseDialogComponent } from '../dialogs/license-dialog/license-dialog.component';

@Component({
  selector: 'information-component',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  public applicationName: string;
  public applicationVersion: string;
  public applicationCopyright: string;
  public websiteUrl: string;
  public emailAddress: string;
  public facebookUrl: string;
  public twitterUrl: string;
  public externalComponents: any[];

  constructor(private dialog: MatDialog) {
    this.applicationName = Constants.applicationName.toUpperCase();
    this.applicationVersion = Constants.applicationVersion;
    this.applicationCopyright = Constants.applicationCopyright;
    this.websiteUrl = Constants.websiteUrl;
    this.emailAddress = Constants.emailAddress;
    this.facebookUrl = Constants.facebookUrl;
    this.twitterUrl = Constants.twitterUrl;
    this.externalComponents = Constants.externalComponents;
  }

  ngOnInit() {
  }

  openLicenseDialog(): void {
    const dialogRef = this.dialog.open(LicenseDialogComponent, {
      width: '450px'
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   this.animal = result;
    // });
  }

  openDonateLink(): void {
    require('electron').shell.openExternal(Constants.donateUrl);
  }
}
