import { Mock, Times, It } from 'typemoq';
import * as assert from 'assert';
import { UpdateService } from '../../app/services/update/update.service';
import { SnackBarService } from '../../app/services/snack-bar/snack-bar.service';
import { Settings } from '../../app/core/settings';
import { Logger } from '../../app/core/logger';
import { GitHubApi } from '../../app/core/github-api';
import { ProductDetails } from '../../app/core/product-details';

describe('UpdateService', () => {
    describe('checkForUpdatesAsync', () => {
        it('Should not check for updates when the update check is disabled', async () => {
            // Arrange
            const snackBarMock = Mock.ofType<SnackBarService>();
            const settingsMock = Mock.ofType<Settings>();
            const loggerMock = Mock.ofType<Logger>();
            const gitHubMock = Mock.ofType<GitHubApi>();
            const productDetailsMock = Mock.ofType<ProductDetails>();

            settingsMock.setup(x => x.checkForUpdates).returns(() => false);

            const update: UpdateService = new UpdateService(
                snackBarMock.object,
                settingsMock.object,
                loggerMock.object,
                gitHubMock.object,
                productDetailsMock.object);

            // Act
            await update.checkForUpdatesAsync();

            // Assert
            gitHubMock.verify(x => x.getLastestReleaseAsync(It.isAnyString(), It.isAnyString()), Times.never());
        });

        it('Should check for updates when the update check is enabled', async () => {
            // Arrange
            const snackBarMock = Mock.ofType<SnackBarService>();
            const settingsMock = Mock.ofType<Settings>();
            const loggerMock = Mock.ofType<Logger>();
            const gitHubMock = Mock.ofType<GitHubApi>();
            const productDetailsMock = Mock.ofType<ProductDetails>();

            settingsMock.setup(x => x.checkForUpdates).returns(() => true);

            const update: UpdateService = new UpdateService(
                snackBarMock.object,
                settingsMock.object,
                loggerMock.object,
                gitHubMock.object,
                productDetailsMock.object);

            // Act
            await update.checkForUpdatesAsync();

            // Assert
            gitHubMock.verify(x => x.getLastestReleaseAsync('digimezzo', 'knowte'), Times.exactly(1));
        });

        it('Should notify the user when the latest release is newer than the current version', async () => {
            // Arrange
            const snackBarMock = Mock.ofType<SnackBarService>();
            const settingsMock = Mock.ofType<Settings>();
            const loggerMock = Mock.ofType<Logger>();
            const gitHubMock = Mock.ofType<GitHubApi>();
            const productDetailsMock = Mock.ofType<ProductDetails>();

            settingsMock.setup(x => x.checkForUpdates).returns(() => true);
            gitHubMock.setup(x => x.getLastestReleaseAsync('digimezzo', 'knowte')).returns(async () => '2.0.3');
            productDetailsMock.setup(x => x.version).returns(() => '2.0.2');

            const update: UpdateService = new UpdateService(
                snackBarMock.object,
                settingsMock.object,
                loggerMock.object,
                gitHubMock.object,
                productDetailsMock.object);

            // Act
            await update.checkForUpdatesAsync();

            // Assert
            snackBarMock.verify(x => x.notifyOfNewVersionAsync('2.0.3'), Times.exactly(1));
        });

        it('Should not notify the user when the latest release is the same as the current version', async () => {
            // Arrange
            const snackBarMock = Mock.ofType<SnackBarService>();
            const settingsMock = Mock.ofType<Settings>();
            const loggerMock = Mock.ofType<Logger>();
            const gitHubMock = Mock.ofType<GitHubApi>();
            const productDetailsMock = Mock.ofType<ProductDetails>();

            settingsMock.setup(x => x.checkForUpdates).returns(() => true);
            gitHubMock.setup(x => x.getLastestReleaseAsync('digimezzo', 'knowte')).returns(async () => '2.0.2');
            productDetailsMock.setup(x => x.version).returns(() => '2.0.2');

            const update: UpdateService = new UpdateService(
                snackBarMock.object,
                settingsMock.object,
                loggerMock.object,
                gitHubMock.object,
                productDetailsMock.object);

            // Act
            await update.checkForUpdatesAsync();

            // Assert
            snackBarMock.verify(x => x.notifyOfNewVersionAsync(It.isAnyString()), Times.never());
        });

        it('Should not notify the user when the latest release is older than the current version', async () => {
            // Arrange
            const snackBarMock = Mock.ofType<SnackBarService>();
            const settingsMock = Mock.ofType<Settings>();
            const loggerMock = Mock.ofType<Logger>();
            const gitHubMock = Mock.ofType<GitHubApi>();
            const productDetailsMock = Mock.ofType<ProductDetails>();

            settingsMock.setup(x => x.checkForUpdates).returns(() => true);
            gitHubMock.setup(x => x.getLastestReleaseAsync('digimezzo', 'knowte')).returns(async () => '2.0.1');
            productDetailsMock.setup(x => x.version).returns(() => '2.0.2');

            const update: UpdateService = new UpdateService(
                snackBarMock.object,
                settingsMock.object,
                loggerMock.object,
                gitHubMock.object,
                productDetailsMock.object);

            // Act
            await update.checkForUpdatesAsync();

            // Assert
            snackBarMock.verify(x => x.notifyOfNewVersionAsync(It.isAnyString()), Times.never());
        });
    });
});
