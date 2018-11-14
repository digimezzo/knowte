import { Component, OnInit, Inject } from '@angular/core';
import { CollectionService } from '../../../services/collection.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Collection } from '../../../data/collection';

@Component({
    selector: 'rename-collection-dialog',
    templateUrl: './renameCollectionDialog.component.html',
    styleUrls: ['./renameCollectionDialog.component.scss']
})
export class RenameCollectionDialogComponent implements OnInit {
    constructor(private collectionService: CollectionService, private dialogRef: MatDialogRef<RenameCollectionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.collectionId = data.collectionId;
        this.collectionName = this.collectionService.getCollectionName(data.collectionId);
    }

    public collectionName: string;
    public collectionId: string;

    public async renameCollectionAsync(): Promise<void> {
        await this.collectionService.renameCollectionAsync(this.collectionId, this.collectionName);
    }

    public async renameCollectionAndCloseAsync(): Promise<void> {
        await this.renameCollectionAsync();
        this.dialogRef.close();
    }

    ngOnInit() {
    }
}
