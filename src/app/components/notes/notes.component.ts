import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import log from 'electron-log';
import { Notebook } from '../../data/notebook';
import { MatDialog, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { NotebookOperation } from '../../services/notebookOperation';
import { InputDialogComponent } from '../dialogs/inputDialog/inputDialog.component';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';
import { SnackBarService } from '../../services/snackBar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'notes-page',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotesComponent implements OnInit {
  constructor(private dialog: MatDialog, private collectionService: CollectionService,
    private translateService: TranslateService, private snackBarService: SnackBarService) {
  }

  private subscription: Subscription;

  public allNotesCount: number = 0;
  public todayNotesCount: number = 0;
  public yesterdayNotesCount: number = 0;
  public thisWeekNotesCount: number = 0;
  public markedNotesCount: number = 0;
  public selectedNotesCount: number = 0;

  public notebooks: Notebook[];
  public selectedNotebook: Notebook;

  public canEditSelectedNotebook: boolean = false;

  ngOnInit() {
    log.info("Showing notes page");

    this.notebooks = this.collectionService.getNotebooks();
    this.selectedNotebook = this.notebooks[0]; // Select 1st notebook by default

    this.subscription = this.collectionService.notebookAdded$.subscribe(async (notebookName) => {
      this.notebooks = await this.collectionService.getNotebooks();
      this.snackBarService.notebookAdded(notebookName);
    });

    this.subscription.add(this.collectionService.notebookRenamed$.subscribe(async (newNotebookName) => {
      this.notebooks = await this.collectionService.getNotebooks();
      this.snackBarService.notebookRenamed(newNotebookName);
    }));

    this.subscription.add(this.collectionService.notebookDeleted$.subscribe(async (notebookName) => {
      this.notebooks = this.collectionService.getNotebooks();
      this.snackBarService.notebookDeleted(notebookName);
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public setSelectedNotebook(notebook: Notebook) {
    this.selectedNotebook = notebook;
    this.canEditSelectedNotebook = this.selectedNotebook != null && !this.selectedNotebook.isDefault;
    log.info(`Selected notebook: ${notebook.name}`);
  }

  public addNotebook(): void {
    let titleText: string = this.translateService.instant('DialogTitles.AddNotebook');
    let placeholderText: string = this.translateService.instant('Input.NotebookName');

    let dialogRef: MatDialogRef<InputDialogComponent> = this.dialog.open(InputDialogComponent, {
      width: '450px', data: { titleText: titleText, placeholderText: placeholderText }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        let notebookName: string = dialogRef.componentInstance.inputText;

        let operation: NotebookOperation = this.collectionService.addNotebook(notebookName);

        switch (operation) {
          case NotebookOperation.Duplicate: {
            this.snackBarService.duplicateNotebook(notebookName);
            break;
          }
          case NotebookOperation.Error: {
            this.dialog.open(ErrorDialogComponent, {
              width: '450px', data: { errorText: this.translateService.instant('ErrorTexts.AddNotebookError').replace("{notebookName}", `'${notebookName}'`) }
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

  public renameNotebook(): void {
  }

  public deleteNotebook(): void {

  }
}
