import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
    this.subscription.add(collectionService.collectionsChanged$.subscribe(() => this.collections = this.collectionService.getCollections()));
    this.hasStorageDirectory = collectionService.hasStorageDirectory;
  }

  public hasStorageDirectory: boolean;
  public collections: Collection[];

  ngOnInit() {
    this.collections = this.collectionService.getCollections();
  }

  public addCollection(): void {
    let dialogRef: MatDialogRef<AddCollectionDialogComponent> = this.dialog.open(AddCollectionDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.collectionService.addCollection("defaultdd collection");
    });
  }

  public activateCollection(collectionId: string) {
    log.info(`user pressed activateCollection(${collectionId})`);
  }

  public renameCollection(collectionId: string) {
    log.info(`user pressed renameCollection(${collectionId})`);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
