import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Constants } from '../../core/constants';
import { LicenseDialogComponent } from '../dialogs/license-dialog/license-dialog.component';
import { AppearanceService } from '../../services/appearance/appearance.service';
import { ProductDetails } from '../../core/product-details';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InformationComponent implements OnInit {
  constructor(private dialog: MatDialog, public appearance: AppearanceService, private productDetails: ProductDetails) {
  }

  public applicationVersion: string = this.productDetails.version;
  public applicationCopyright: string = this.productDetails.copyright;
  public websiteUrl: string = Constants.websiteUrl;
  public twitterUrl: string = Constants.twitterUrl;
  public githubUrl: string = Constants.githubUrl;
  public externalComponents: any[] = Constants.externalComponents;

  public ngOnInit(): void {
  }

  public openLicenseDialog(): void {
    const dialogRef: MatDialogRef<LicenseDialogComponent> = this.dialog.open(LicenseDialogComponent, {
      width: '450px'
    });
  }

  public openDonateLink(): void {
    require('electron').shell.openExternal(Constants.donateUrl);
  }
}
