import { Injectable } from '@angular/core';
import { Settings } from '../../core/settings';
import { SnackBarService } from '../snack-bar/snack-bar.service';
import { Logger } from '../../core/logger';
import { GitHubApi } from '../../core/github-api';
import { ProductDetails } from '../../core/product-details';
import { VersionComparer } from '../../core/version-comparer';

@Injectable({
    providedIn: 'root'
})
export class UpdateService {
    constructor(private snackBar: SnackBarService, private settings: Settings, private logger: Logger,
        private gitHub: GitHubApi, private productDetails: ProductDetails) {
    }

    public async checkForUpdatesAsync(): Promise<void> {
        if (this.settings.checkForUpdates) {
            this.logger.info('Checking for updates', 'UpdateService', 'checkForUpdatesAsync');

            try {
                const currentRelease: string = this.productDetails.version;
                const latestRelease: string = await this.gitHub.getLastestReleaseAsync('digimezzo', 'knowte');

                this.logger.info(
                    `Current=${currentRelease}, Latest=${latestRelease}`,
                    'UpdateService',
                    'checkForUpdatesAsync');

                if (VersionComparer.isNewerVersion(currentRelease, latestRelease)) {
                    this.logger.info(
                        `Latest (${latestRelease}) > Current (${currentRelease}). Notifying user.`,
                        'UpdateService',
                        'checkForUpdatesAsync');
                        await this.snackBar.notifyOfNewVersionAsync(latestRelease);
                } else {
                    this.logger.info(
                        `Latest (${latestRelease}) <= Current (${currentRelease}). Nothing to do.`,
                        'UpdateService',
                        'checkForUpdatesAsync');
                }
            } catch (error) {
                this.logger.error(`Could not check for updates. Cause: ${error}`, 'UpdateService', 'checkForUpdatesAsync');
            }
        } else {
            this.logger.info('Not checking for updates', 'UpdateService', 'checkForUpdatesAsync');
        }
    }
}
