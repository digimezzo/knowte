import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { AddCollectionDialogComponent } from '../dialogs/addCollectionDialog/addCollectionDialog.component';
import { MatDialog, MatDialogRef, MatSnackBarModule, MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Subscription } from 'rxjs';
import { Collection } from '../../data/collection';
import log from 'electron-log';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'main-menu-button',
  templateUrl: './mainMenuButton.component.html',
  styleUrls: ['./mainMenuButton.component.scss']
})
export class MainMenuButtonComponent implements OnInit {
  private subscription: Subscription;

  constructor(private dialog: MatDialog, private collectionService: CollectionService,
    private snackBar: MatSnackBar, private translate: TranslateService) {
    this.subscription = collectionService.storageDirectoryChanged$.subscribe((hasStorageDirectory) => this.hasStorageDirectory = hasStorageDirectory);
    this.subscription.add(collectionService.collectionsChanged$.subscribe(async () => this.collections = await this.collectionService.getCollectionsAsync()));
    
    this.subscription.add(collectionService.collectionActivated$.subscribe(async(collectionName) => {
      this.collections = await this.collectionService.getCollectionsAsync();
      let message: string = this.translate.instant('SnackBarMessages.CollectionActivated').replace("{collectionName}",`'${collectionName}'`);
      this.snackBar.open(message, "", { duration: 2000 });
    })); 

    this.subscription.add(collectionService.collectionAdded$.subscribe(async(collectionName) => {
      let message: string = this.translate.instant('SnackBarMessages.CollectionAdded').replace("{collectionName}",`'${collectionName}'`);
      this.snackBar.open(message, "", { duration: 2000 });
    })); 

    this.hasStorageDirectory = this.collectionService.hasStorageDirectory();
  }

  public hasStorageDirectory: boolean;
  public collections: Collection[];

  ngOnInit() {
    this.collectionService.getCollectionsAsync().then(collections => this.collections = collections);
  }

  public addCollection(): void {
    let dialogRef: MatDialogRef<AddCollectionDialogComponent> = this.dialog.open(AddCollectionDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.collectionService.addCollection("defaultdd collection");
    });
  }

  public async activateCollection(collectionId: string) {
    log.info(`Pressed activateCollection(${collectionId})`);
    this.collectionService.activateCollection(collectionId);
  }

  public renameCollection(collectionId: string) {
    log.info(`Pressed renameCollection(${collectionId})`);
  }

  public deleteCollection(collectionId: string) {
    log.info(`Pressed deleteCollection(${collectionId})`);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
