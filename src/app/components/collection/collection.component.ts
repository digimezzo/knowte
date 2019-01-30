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
import { ConfirmationDialogComponent } from '../dialogs/confirmationDialog/confirmationDialog.component';
import { RenameNotebookDialogComponent } from '../dialogs/renameNotebookDialog/renameNotebookDialog.component';
import { ipcRenderer } from 'electron';
import { Note } from '../../data/note';
import { AddNoteResult } from '../../services/addNoteResult';
import { NoteOperation } from '../../services/noteOperation';

@Component({
  selector: 'collection-page',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CollectionComponent implements OnInit {
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
  public notes: Note[];
  public selectedNote: Note;

  public canEditSelectedNotebook: boolean = false;
  public canEditSelectedNote: boolean = false;

  async ngOnInit() {
    log.info(`Notes`);

    // Notebooks
    this.notebooks = await this.collectionService.getNotebooksAsync();
    this.selectedNotebook = this.notebooks[0]; // Select 1st notebook by default

    this.subscription = this.collectionService.notebookAdded$.subscribe(async (notebookName) => {
      this.notebooks = await this.collectionService.getNotebooksAsync();
      this.snackBarService.notebookAdded(notebookName);
    });

    this.subscription.add(this.collectionService.notebookRenamed$.subscribe(async (newNotebookName) => {
      this.notebooks = await this.collectionService.getNotebooksAsync();
      this.snackBarService.notebookRenamed(newNotebookName);
    }));

    this.subscription.add(this.collectionService.notebookDeleted$.subscribe(async (notebookName) => {
      this.notebooks = await this.collectionService.getNotebooksAsync();
      this.snackBarService.notebookDeleted(notebookName);
    }));

    // Notes
    this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id);

    this.subscription = this.collectionService.noteAdded$.subscribe(async (noteTitle) => {
      this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id);
      this.snackBarService.noteAdded(noteTitle);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public async setSelectedNotebookAsync(notebook: Notebook) {
    this.selectedNotebook = notebook;
    this.canEditSelectedNotebook = this.selectedNotebook != null && !this.selectedNotebook.isDefault;

    // Fetch the notes for the newly selected notebook
    this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id);
  }

  public async addNotebookAsync(): Promise<void> {
    let titleText: string = await this.translateService.get('DialogTitles.AddNotebook').toPromise();
    let placeholderText: string = await this.translateService.get('Input.NotebookName').toPromise();

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
            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.AddNotebookError', { notebookName: notebookName }).toPromise());
            this.dialog.open(ErrorDialogComponent, {
              width: '450px', data: { errorText: generatedErrorText }
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
    let dialogRef: MatDialogRef<RenameNotebookDialogComponent> = this.dialog.open(RenameNotebookDialogComponent, {
      width: '450px', data: { notebookId: this.selectedNotebook.id }
    });
  }

  public async deleteNotebookAsync(): Promise<void> {
    let notebookName: string = this.collectionService.getNotebookName(this.selectedNotebook.id);
    let title: string = await this.translateService.get('DialogTitles.ConfirmDeleteNotebook').toPromise();
    let text: string = await this.translateService.get('DialogTexts.ConfirmDeleteNotebook', { notebookName: notebookName }).toPromise();

    let dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {

      width: '450px', data: { dialogTitle: title, dialogText: text }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.collectionService.deleteNotebookAsync(this.selectedNotebook.id);
      }
    });
  }

  public setSelectedNote(note: Note) {
    this.selectedNote = note;
  }

  public deleteNote(): void {
  }

  public async addNoteAsync(): Promise<void> {
    let baseTitle: string = await this.translateService.get('Notes.NewNote').toPromise();

    // Create a new note
    let addNoteResult: AddNoteResult = this.collectionService.addNote(baseTitle, this.selectedNotebook.id);

    if (addNoteResult.operation === NoteOperation.Success) {
      // Show the note window
      ipcRenderer.send('open-note-window', addNoteResult.noteId);
    }
  }

  public openNote(): void{
    ipcRenderer.send('open-note-window', this.selectedNote.id);
  }
}
