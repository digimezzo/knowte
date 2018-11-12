import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../../services/collection.service';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'add-collection-dialog',
    templateUrl: './addCollectionDialog.component.html',
    styleUrls: ['./addCollectionDialog.component.scss']
})
export class AddCollectionDialogComponent implements OnInit {
    constructor(private collectionService: CollectionService, private dialogRef:MatDialogRef<AddCollectionDialogComponent>) {

    }

    public collectionName: string;

    public addCollection(): void {
        this.collectionService.addCollection(this.collectionName);
    }

    public addCollectionAndClose(): void{
        this.addCollection();
        this.dialogRef.close();
    }

    ngOnInit() {
    }
}
