import { Component, OnInit, OnDestroy } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { InputDialogComponent } from '../dialogs/inputDialog/inputDialog.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { Collection } from '../../data/collection';
import log from 'electron-log';
import { RenameCollectionDialogComponent } from '../dialogs/renameCollectionDialog/renameCollectionDialog.component';
import { SnackBarService } from '../../services/snackBar.service';
import { ConfirmationDialogComponent } from '../dialogs/confirmationDialog/confirmationDialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CollectionOperation } from '../../services/collectionOperation';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'main-menu-button',
  templateUrl: './mainMenuButton.component.html',
  styleUrls: ['./mainMenuButton.component.scss']
})
export class MainMenuButtonComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(private dialog: MatDialog, private collectionService: CollectionService,
    private snackBarService: SnackBarService, private translateService: TranslateService, public router: Router) {
  }

  public canShow: boolean = false;
  public collections: Collection[];

  ngOnInit() {
    // Workaround for auto reload
    this.canShow = this.collectionService.hasDataStore;

    if (this.collectionService.hasDataStore) {
      this.collections = this.collectionService.getCollections();
    }
    // End of workaround for auto reload

    this.subscription = this.collectionService.dataStoreInitialized$.subscribe(() => {
      this.canShow = true;
      this.collections = this.collectionService.getCollections();
    });

    this.subscription.add(this.collectionService.collectionsChanged$.subscribe(() => this.collections = this.collectionService.getCollections()));

    this.subscription.add(this.collectionService.collectionActivated$.subscribe(async (collectionName) => {
      this.collections = await this.collectionService.getCollections();
      this.snackBarService.collectionActivated(collectionName);
    }));

    this.subscription.add(this.collectionService.collectionAdded$.subscribe(async (collectionName) => {
      this.collections = await this.collectionService.getCollections();
      this.snackBarService.collectionAdded(collectionName);
    }));

    this.subscription.add(this.collectionService.collectionRenamed$.subscribe(async (newCollectionName) => {
      this.collections = await this.collectionService.getCollections();
      this.snackBarService.collectionRenamed(newCollectionName);
    }));

    this.subscription.add(this.collectionService.collectionDeleted$.subscribe(async (collectionName) => {
      this.collections = this.collectionService.getCollections();
      this.snackBarService.collectionDeleted(collectionName);
    }));
  }

  public addCollection(): void {
    log.info("Pressed addCollection()");

    let titleText: string = this.translateService.instant('DialogTitles.AddCollection');
    let placeholderText: string = this.translateService.instant('Input.CollectionName');

    let dialogRef: MatDialogRef<InputDialogComponent> = this.dialog.open(InputDialogComponent, {
      width: '450px', data: { titleText: titleText, placeholderText: placeholderText }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        let collectionName: string = dialogRef.componentInstance.inputText;

        let operation: CollectionOperation = this.collectionService.addCollection(collectionName);

        switch (operation) {
          case CollectionOperation.Duplicate: {
            this.snackBarService.duplicateCollection(collectionName);
            break;
          }
          case CollectionOperation.Error: {
            this.dialog.open(ErrorDialogComponent, {
              width: '450px', data: { errorText: this.translateService.instant('ErrorTexts.AddCollectionError').replace("{collectionName}", `'${collectionName}'`) }
            });
            break;
          }
          default: {
            // Other cases don't need handling
            break;
          }
        }
      }
    });
  }

  public async activateCollection(collectionId: string) {
    log.info(`Pressed activateCollection(${collectionId})`);
    this.collectionService.activateCollection(collectionId);
  }

  public renameCollection(collectionId: string) {
    log.info(`Pressed renameCollection(${collectionId})`);

    let dialogRef: MatDialogRef<RenameCollectionDialogComponent> = this.dialog.open(RenameCollectionDialogComponent, {
      width: '450px', data: { collectionId: collectionId }
    });
  }

  public deleteCollection(collectionId: string) {
    log.info(`Pressed deleteCollection(${collectionId})`);

    let collectionName: string = this.collectionService.getCollectionName(collectionId);
    let title: string = this.translateService.instant('DialogTitles.ConfirmDeleteCollection');
    let text: string = this.translateService.instant('DialogTexts.ConfirmDeleteCollection').replace("{collectionName}", `"${collectionName}"`);

    let dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {

      width: '450px', data: { dialogTitle: title, dialogText: text }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.collectionService.deleteCollectionAsync(collectionId);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
