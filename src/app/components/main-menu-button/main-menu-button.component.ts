import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../providers/collection.service';
import {AddCollectionDialogComponent } from '../dialogs/add-collection-dialog/add-collection-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'main-menu-button',
  templateUrl: './main-menu-button.component.html',
  styleUrls: ['./main-menu-button.component.scss']
})
export class MainMenuButtonComponent implements OnInit {

  constructor(private dialog: MatDialog, private collectionService: CollectionService) { }

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
}
