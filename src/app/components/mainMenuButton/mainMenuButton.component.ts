import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { AddCollectionDialogComponent } from '../dialogs/addCollectionDialog/addCollectionDialog.component';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'main-menu-button',
  templateUrl: './mainMenuButton.component.html',
  styleUrls: ['./mainMenuButton.component.scss']
})
export class MainMenuButtonComponent implements OnInit {
  private subscription: Subscription;

  constructor(private dialog: MatDialog, private collectionService: CollectionService) {
    this.subscription = collectionService.storageDirectoryInitialized$.subscribe((hasCollections) => this.hasCollections = hasCollections);
    this.hasCollections = collectionService.hasCollections;
  }

  public hasCollections: boolean;

  ngOnInit() {
  }

  public addCollection(): void {
    const dialogRef = this.dialog.open(AddCollectionDialogComponent, {
      width: '450px'
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   this.animal = result;
    // });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
