import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../../services/collection.service';
import { MatDialogRef, MatDialog } from '@angular/material';
import { CollectionOperation } from '../../../services/collectionOperation';
import { SnackBarService } from '../../../services/snackBar.service';
import { ErrorDialogComponent } from '../errorDialog/errorDialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'add-collection-dialog',
    templateUrl: './addCollectionDialog.component.html',
    styleUrls: ['./addCollectionDialog.component.scss']
})
export class AddCollectionDialogComponent implements OnInit {
    constructor(private collectionService: CollectionService, private dialogRef: MatDialogRef<AddCollectionDialogComponent>,
        private snackBarService: SnackBarService, private dialog: MatDialog, private translate: TranslateService) {
    }

    public collectionName: string;

    public addCollection(): void {
        let operation: CollectionOperation = this.collectionService.addCollection(this.collectionName);

        switch (operation) {
            case CollectionOperation.Duplicate: {
                this.snackBarService.duplicateCollection(this.collectionName);
                break;
            }
            case CollectionOperation.Error: {
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px', data: { errorText: this.translate.instant('ErrorTexts.AddCollectionError').replace("{collectionName}", `'${this.collectionName}'`) }
                });
                break;
            }
            default: {
                // Other cases don't need handling
                break;
            }
        }
    }

    public addCollectionAndClose(): void {
        this.addCollection();
        this.dialogRef.close();
    }

    ngOnInit() {
    }
}
