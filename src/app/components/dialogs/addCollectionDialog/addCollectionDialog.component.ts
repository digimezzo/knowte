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

    public async addCollectionAsync(): Promise<void> {
        await this.collectionService.addCollectionAsync(this.collectionName);
    }

    public async addCollectionAndCloseAsync(): Promise<void> {
        await this.addCollectionAsync();
        this.dialogRef.close();
    }

    ngOnInit() {
    }
}
