import { Component, OnInit, OnDestroy } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { InputDialogComponent } from '../dialogs/inputDialog/inputDialog.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { Collection } from '../../data/entities/collection';
import log from 'electron-log';
import { RenameCollectionDialogComponent } from '../dialogs/renameCollectionDialog/renameCollectionDialog.component';
import { SnackBarService } from '../../services/snackBar.service';
import { ConfirmationDialogComponent } from '../dialogs/confirmationDialog/confirmationDialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';
import { Router } from '@angular/router';
import { Operation } from '../../core/enums';

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

  async ngOnInit() {
    this.subscription = this.collectionService.dataStoreInitialized$.subscribe(async () => {
      this.canShow = true;
      await this.getCollectionsAsync();
    });

    this.subscription.add(this.collectionService.collectionAdded$.subscribe(async (collectionName) => {
      await this.getCollectionsAsync();
      this.snackBarService.collectionAddedAsync(collectionName);
    }));

    this.subscription.add(this.collectionService.collectionRenamed$.subscribe(async (newCollectionName) => {
      await this.getCollectionsAsync();
      this.snackBarService.collectionRenamedAsync(newCollectionName);
    }));

    this.subscription.add(this.collectionService.collectionDeleted$.subscribe(async (collectionName) => {
      await this.getCollectionsAsync();
      this.snackBarService.collectionDeletedAsync(collectionName);
    }));

    this.subscription.add(this.collectionService.collectionActivated$.subscribe(async (collectionName) => {
      await this.getCollectionsAsync();
      this.snackBarService.collectionActivatedAsync(collectionName);
    }));

    // Workaround for auto reload
    await this.collectionService.initializeDataStoreAsync();
  }

  private async getCollectionsAsync(): Promise<void> {
    this.collections = await this.collectionService.getCollections();
  }

  public async addCollectionAsync(): Promise<void> {
    log.info("Pressed addCollection()");

    let titleText: string = await this.translateService.get('DialogTitles.AddCollection').toPromise();
    let placeholderText: string = await this.translateService.get('Input.CollectionName').toPromise();

    let dialogRef: MatDialogRef<InputDialogComponent> = this.dialog.open(InputDialogComponent, {
      width: '450px', data: { titleText: titleText, placeholderText: placeholderText }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        let collectionName: string = dialogRef.componentInstance.inputText;

        let operation: Operation = this.collectionService.addCollection(collectionName);

        switch (operation) {
          case Operation.Duplicate: {
            this.snackBarService.duplicateCollectionAsync(collectionName);
            break;
          }
          case Operation.Error: {
            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.AddCollectionError', { collectionName: collectionName }).toPromise());
            this.dialog.open(ErrorDialogComponent, {
              width: '450px', data: { errorText: generatedErrorText }
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

  public async deleteCollectionAsync(collectionId: string): Promise<void> {
    log.info(`Pressed deleteCollection(${collectionId})`);

    let collectionName: string = this.collectionService.getCollectionName(collectionId);
    let title: string = await this.translateService.get('DialogTitles.ConfirmDeleteCollection').toPromise();
    let text: string = await this.translateService.get('DialogTexts.ConfirmDeleteCollection', { collectionName: collectionName }).toPromise();

    let dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {

      width: '450px', data: { dialogTitle: title, dialogText: text }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        let operation: Operation = await this.collectionService.deleteCollectionAsync(collectionId);

        if (operation === Operation.Error) {
          let generatedErrorText: string = (await this.translateService.get('ErrorTexts.DeleteCollectionError', { collectionName: collectionName }).toPromise());
          this.dialog.open(ErrorDialogComponent, {
            width: '450px', data: { errorText: generatedErrorText }
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
