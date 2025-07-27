import { Component, ViewEncapsulation } from '@angular/core';
import {Constants} from "../../../common/application/constants";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {LicenseDialogComponent} from "../../dialogs/license-dialog/license-dialog.component";
import {ProductInformation} from "../../../common/application/product-information";

@Component({
    selector: 'app-information-about',
    host: { style: 'display: block; width: 100%;' },
    templateUrl: './information-about.component.html',
    styleUrls: ['./information-about.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class InformationAboutComponent {
    public constructor(private dialog: MatDialog) {}

    public applicationVersion: string = ProductInformation.applicationVersion;
    public applicationCopyright: string = ProductInformation.applicationCopyright;
    public websiteUrl: string = Constants.websiteUrl;
    public twitterUrl: string = Constants.twitterUrl;
    public mastodonUrl: string = Constants.mastodonUrl;
    public githubUrl: string = Constants.githubUrl;

    public openLicenseDialog(): void {
        const dialogRef: MatDialogRef<LicenseDialogComponent> = this.dialog.open(LicenseDialogComponent, {
            width: '450px',
        });
    }

    public openDonateLink(): void {
        require('electron').shell.openExternal(Constants.donateUrl);
    }
}
