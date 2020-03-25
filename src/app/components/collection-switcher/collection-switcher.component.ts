import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection/collection.service';
import { InputDialogComponent } from '../dialogs/input-dialog/input-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { RenameCollectionDialogComponent } from '../dialogs/rename-collection-dialog/rename-collection-dialog.component';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
import { Router } from '@angular/router';
import { Operation } from '../../core/enums';
import { TranslatorService } from '../../services/translator/translator.service';

@Component({
  selector: 'app-collection-switcher',
  templateUrl: './collection-switcher.component.html',
  styleUrls: ['./collection-switcher.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CollectionSwitcherComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(private dialog: MatDialog, public collection: CollectionService,
    private snackBar: SnackBarService, private translator: TranslatorService, public router: Router) {
  }

  public collections: string[];
  public activeCollection: string = '';

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public async ngOnInit(): Promise<void> {
    // Workaround for auto reload
    await this.collection.initializeAsync();
    await this.getCollectionsAsync();

    this.subscription = this.collection.collectionsChanged$.subscribe(() => this.router.navigate(['/loading']));
  }

  public async addCollectionAsync(): Promise<void> {
    if (this.collection.hasOpenNotes()) {
      this.snackBar.closeNoteBeforeChangingCollectionsAsync();
      return;
    }

    const titleText: string = await this.translator.getAsync('DialogTitles.AddCollection');
    const placeholderText: string = await this.translator.getAsync('Input.Collection');

    const dialogRef: MatDialogRef<InputDialogComponent> = this.dialog.open(InputDialogComponent, {
      width: '450px', data: { titleText: titleText, placeholderText: placeholderText }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        const collection: string = dialogRef.componentInstance.inputText;

        const operation: Operation = await this.collection.addCollectionAsync(collection);

        switch (operation) {
          case Operation.Duplicate: {
            this.snackBar.duplicateCollectionAsync(collection);
            break;
          }
          case Operation.Error: {
            const errorText: string = await this.translator.getAsync('ErrorTexts.AddCollectionError', { collection: collection });
            this.dialog.open(ErrorDialogComponent, {
              width: '450px', data: { errorText: errorText }
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

  public async activateCollection(collection: string): Promise<void> {
    if (collection === this.activeCollection) {
      return;
    }

    if (this.collection.hasOpenNotes()) {
      this.snackBar.closeNoteBeforeChangingCollectionsAsync();
      return;
    }

    this.collection.activateCollection(collection);
  }

  public renameCollection(collection: string): void {
    if (this.collection.hasOpenNotes()) {
      this.snackBar.closeNoteBeforeChangingCollectionsAsync();
      return;
    }

    const dialogRef: MatDialogRef<RenameCollectionDialogComponent> = this.dialog.open(RenameCollectionDialogComponent, {
      width: '450px', data: { oldCollection: collection }
    });
  }

  public async deleteCollectionAsync(collection: string): Promise<void> {
    if (this.collection.hasOpenNotes()) {
      this.snackBar.closeNoteBeforeChangingCollectionsAsync();
      return;
    }

    const title: string = await this.translator.getAsync('DialogTitles.ConfirmDeleteCollection');
    const text: string = await this.translator.getAsync('DialogTexts.ConfirmDeleteCollection', { collection: collection });

    const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {

      width: '450px', data: { dialogTitle: title, dialogText: text }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        const operation: Operation = await this.collection.deleteCollectionAsync(collection);

        if (operation === Operation.Error) {
          const errorText: string = await this.translator.getAsync('ErrorTexts.DeleteCollectionError', { collection: collection });
          this.dialog.open(ErrorDialogComponent, {
            width: '450px', data: { errorText: errorText }
          });
        }
      }
    });
  }

  private async getCollectionsAsync(): Promise<void> {
    this.collections = await this.collection.getCollectionsAsync();
    this.activeCollection = this.collection.getActiveCollection();
  }
}
