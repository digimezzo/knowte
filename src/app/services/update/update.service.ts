import { Injectable } from '@angular/core';
import { GitHubApi } from '../../common/api/github-api';
import { ProductInformation } from '../../common/application/product-information';
import { Desktop } from '../../common/io/desktop';
import { Logger } from '../../common/logging/logger';
import { BaseSettings } from '../../common/settings/base-settings';
import { VersionComparer } from './version-comparer';
@Injectable()
export class UpdateService {
    public _isUpdateAvailable: boolean = false;
    private _latestRelease: string = '';

    constructor(private settings: BaseSettings, private logger: Logger, private gitHub: GitHubApi, private desktop: Desktop) {}

    public get isUpdateAvailable(): boolean {
        return this._isUpdateAvailable;
    }

    public get latestRelease(): string {
        return this._latestRelease;
    }

    public async checkForUpdatesAsync(): Promise<void> {
        if (this.settings.checkForUpdates) {
            this.logger.info('Checking for updates', 'UpdateService', 'checkForUpdatesAsync');

            try {
                const currentRelease: string = ProductInformation.applicationVersion;
                const latestRelease: string = await this.gitHub.getLatestReleaseAsync(
                    'digimezzo',
                    ProductInformation.applicationName.toLowerCase(),
                    false
                );

                this.logger.info(`Current=${currentRelease}, Latest=${latestRelease}`, 'UpdateService', 'checkForUpdatesAsync');

                if (VersionComparer.isNewerVersion(currentRelease, latestRelease)) {
                    this.logger.info(
                        `Latest (${latestRelease}) > Current (${currentRelease}). Notifying user.`,
                        'UpdateService',
                        'checkForUpdatesAsync'
                    );

                    this._isUpdateAvailable = true;
                    this._latestRelease = latestRelease;
                } else {
                    this.logger.info(
                        `Latest (${latestRelease}) <= Current (${currentRelease}). Nothing to do.`,
                        'UpdateService',
                        'checkForUpdatesAsync'
                    );
                }
            } catch (error) {
                this.logger.error(`Could not check for updates. Error: ${error.message}`, 'UpdateService', 'checkForUpdatesAsync');
            }
        } else {
            this.logger.info('Not checking for updates', 'UpdateService', 'checkForUpdatesAsync');
        }
    }

    public downloadLatestRelease(): void {
        this.desktop.openLink(
            `https://github.com/digimezzo/${ProductInformation.applicationName.toLowerCase()}/releases/tag/v${this.latestRelease}`
        );
    }
}
