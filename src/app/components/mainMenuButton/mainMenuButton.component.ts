import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { AddCollectionDialogComponent } from '../dialogs/addCollectionDialog/addCollectionDialog.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { Collection } from '../../data/collection';
import log from 'electron-log';

@Component({
  selector: 'main-menu-button',
  templateUrl: './mainMenuButton.component.html',
  styleUrls: ['./mainMenuButton.component.scss']
})
export class MainMenuButtonComponent implements OnInit {
  private subscription: Subscription;

  constructor(private dialog: MatDialog, private collectionService: CollectionService) {
    this.subscription = collectionService.storageDirectoryChanged$.subscribe((hasStorageDirectory) => this.hasStorageDirectory = hasStorageDirectory);
    this.subscription.add(collectionService.collectionsChanged$.subscribe(async() => this.collections = await this.collectionService.getCollectionsAsync()));
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
    // this.collections = await this.collectionService.getCollectionsAsync();
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
