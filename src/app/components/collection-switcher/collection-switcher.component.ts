import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RenameCollectionData } from '../dialogs/rename-collection-dialog/rename-collection-data';
import { Desktop } from '../../common/io/desktop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Constants } from '../../common/application/constants';
import { ProductInformation } from '../../common/application/product-information';
import { Operation } from '../../common/enums/operation';
import { CollectionService } from '../../services/collection/collection.service';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { TrashService } from '../../services/trash/trash.service';
import { UpdateService } from '../../services/update/update.service';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
import { InputDialogComponent } from '../dialogs/input-dialog/input-dialog.component';
import { RenameCollectionDialogComponent } from '../dialogs/rename-collection-dialog/rename-collection-dialog.component';
import { ConfirmationDialogData } from '../dialogs/confirmation-dialog/confirmation-dialog-data';
import { InputData } from '../dialogs/input-dialog/input-data';

@Component({
    selector: 'app-collection-switcher',
    templateUrl: './collection-switcher.component.html',
    styleUrls: ['./collection-switcher.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class CollectionSwitcherComponent implements OnInit, OnDestroy {
    private subscription: Subscription;

    constructor(
        public collectionService: CollectionService,
        public updateService: UpdateService,
        public router: Router,
        private translatorService: TranslatorService,
        private snackBarService: SnackBarService,
        private trashService: TrashService,
        private desktop: Desktop,
        private dialog: MatDialog
    ) {}

    public applicationName: string = ProductInformation.applicationName;

    public collections: string[];
    public activeCollection: string = '';

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public async ngOnInit(): Promise<void> {
        // Workaround for auto reload
        await this.collectionService.initializeAsync();
        await this.getCollectionsAsync();

        this.subscription = this.collectionService.collectionsChanged$.subscribe(() => this.router.navigate(['/loading']));
    }

    public async addCollectionAsync(): Promise<void> {
        if (this.collectionService.hasOpenNotes()) {
            if (!(await this.hasConfirmedToCloseAllNotesAsync())) {
                return;
            }
        }

        const titleText: string = await this.translatorService.getAsync('DialogTitles.AddCollection');
        const placeholderText: string = await this.translatorService.getAsync('Input.Collection');

        const data = new InputData(titleText, '', placeholderText, '', false);

        const dialogRef: MatDialogRef<InputDialogComponent> = this.dialog.open(InputDialogComponent, {
            width: '450px',
            data: data,
        });

        const result = await dialogRef.afterClosed().toPromise();

        if (result) {
            const collection: string = data.inputText;
            const operation: Operation = await this.collectionService.addCollectionAsync(collection);

            switch (operation) {
                case Operation.Duplicate: {
                    this.snackBarService.duplicateCollectionAsync(collection);
                    break;
                }
                case Operation.Error: {
                    const errorText: string = await this.translatorService.getAsync('ErrorTexts.AddCollectionError', {
                        collection: collection,
                    });
                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px',
                        data: { errorText: errorText },
                    });
                    break;
                }
                default: {
                    // Other cases don't need handling
                    break;
                }
            }
        }
    }

    public async activateCollectionAsync(collection: string): Promise<void> {
        if (collection === this.activeCollection) {
            return;
        }

        if (this.collectionService.hasOpenNotes()) {
            if (!(await this.hasConfirmedToCloseAllNotesAsync())) {
                return;
            }
        }

        if (await this.collectionService.activateCollection(collection) === Operation.Error) {
            const errorText: string = await this.translatorService.getAsync('ErrorTexts.ActivateCollectionError', { collection });
            this.dialog.open(ErrorDialogComponent, { width: '450px', data: { errorText } });
        }
    }

    private async hasConfirmedToCloseAllNotesAsync(): Promise<boolean> {
        const title: string = await this.translatorService.getAsync('DialogTitles.ConfirmCloseAllNotes');
        const text: string = await this.translatorService.getAsync('DialogTexts.ConfirmCloseAllNotes');

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: new ConfirmationDialogData(title, text),
        });

        const result = await dialogRef.afterClosed().toPromise();

        if (result) {
            return true;
        }

        return false;
    }

    public async renameCollectionAsync(collection: string): Promise<void> {
        if (this.collectionService.hasOpenNotes()) {
            if (!(await this.hasConfirmedToCloseAllNotesAsync())) {
                return;
            }
        }

        this.dialog.open(RenameCollectionDialogComponent, {
            width: '450px',
            data: new RenameCollectionData(collection),
        });
    }

    public async deleteCollectionAsync(collection: string): Promise<void> {
        if (this.collectionService.hasOpenNotes()) {
            if (!(await this.hasConfirmedToCloseAllNotesAsync())) {
                return;
            }
        }

        const title: string = await this.translatorService.getAsync('DialogTitles.ConfirmDeleteCollection');
        const text: string = await this.translatorService.getAsync('DialogTexts.ConfirmDeleteCollection', { collection: collection });

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: new ConfirmationDialogData(title, text),
        });

        const result = await dialogRef.afterClosed().toPromise();

        if (result) {
            const operation: Operation = await this.collectionService.deleteCollectionAsync(collection);

            if (operation === Operation.Error) {
                const errorText: string = await this.translatorService.getAsync('ErrorTexts.DeleteCollectionError', {
                    collection: collection,
                });
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px',
                    data: { errorText: errorText },
                });
            }
        }
    }

    private async getCollectionsAsync(): Promise<void> {
        this.collections = await this.collectionService.getCollectionsAsync();
        this.activeCollection = this.collectionService.getActiveCollection();
    }

    public openTrash(): void {
        this.trashService.openTrash();
    }

    public openDonateLink(): void {
        this.desktop.openLink(Constants.donateUrl);
    }

    public downloadLatestRelease(): void {
        this.updateService.downloadLatestRelease();
    }
}
