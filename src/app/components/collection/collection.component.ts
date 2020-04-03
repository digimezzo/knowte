import { Component, OnInit, OnDestroy, NgZone, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection/collection.service';
import { Notebook } from '../../data/entities/notebook';
import { MatDialog, MatDialogRef, MatTabChangeEvent } from '@angular/material';
import { InputDialogComponent } from '../dialogs/input-dialog/input-dialog.component';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { Subscription, Subject } from 'rxjs';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { RenameNotebookDialogComponent } from '../dialogs/rename-notebook-dialog/rename-notebook-dialog.component';
import { Constants } from '../../core/constants';
import { Operation } from '../../core/enums';
import { NotesCountResult } from '../../services/results/notes-count-result';
import { NoteMarkResult } from '../../services/results/note-mark-result';
import { NoteOperationResult } from '../../services/results/note-operation-result';
import { Note } from '../../data/entities/note';
import { trigger, style, animate, state, transition } from '@angular/animations';
import { debounceTime } from 'rxjs/internal/operators';
import { remote } from 'electron';
import { FileService } from '../../services/file/file.service';
import { SelectionWatcher } from '../../core/selection-watcher';
import { Logger } from '../../core/logger';
import { TranslatorService } from '../../services/translator/translator.service';
import { AppearanceService } from '../../services/appearance/appearance.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('noteButtonsVisibility', [
      state('visible', style({
        opacity: 1
      })),
      state('hidden', style({
        opacity: 0
      })),
      transition('hidden => visible', animate('.25s')),
      transition('visible => hidden', animate('.05s'))
    ])
  ]
})
export class CollectionComponent implements OnInit, OnDestroy {
  private globalEmitter: any = remote.getGlobal('globalEmitter');
  private subscription: Subscription;

  constructor(private dialog: MatDialog, private collection: CollectionService, private file: FileService,
    private translator: TranslatorService, private snackBar: SnackBarService, public appearance: AppearanceService,
    private zone: NgZone, private logger: Logger) {
  }

  public applicationName: string = Constants.applicationName;
  public notebooksCount: number = 0;
  public allNotesCount: number = 0;
  public todayNotesCount: number = 0;
  public yesterdayNotesCount: number = 0;
  public thisWeekNotesCount: number = 0;
  public markedNotesCount: number = 0;
  public notebooks: Notebook[];
  public activeNotebook: Notebook;
  public hoveredNotebook: Notebook;
  public noteButtonsVisibility: string = 'visible';
  public selectedNoteIds: string[];
  public notesCount: number = 0;
  public canDeleteNotes: boolean = false;
  public tabChangedSubject: Subject<any> = new Subject();
  public showNoteButtonSubject: Subject<any> = new Subject();
  public isBusy: boolean = false;
  public canRenameNotebook: boolean = false;
  public canDeleteNotebooks: boolean = false;
  public selectionWatcher: SelectionWatcher = new SelectionWatcher();

  public get allCategory(): string {
    return Constants.allCategory;
  }

  public get todayCategory(): string {
    return Constants.todayCategory;
  }

  public get yesterdayCategory(): string {
    return Constants.yesterdayCategory;
  }

  public get thisWeekCategory(): string {
    return Constants.thisWeekCategory;
  }

  public get markedCategory(): string {
    return Constants.markedCategory;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public async ngOnInit(): Promise<void> {
    // Workaround for auto reload
    await this.collection.initializeAsync();

    // Get notebooks
    await this.getNotebooksAsync();

    // Subscriptions
    this.subscription = this.collection.notebookEdited$.subscribe(async () => await this.getNotebooksAsync());
    this.subscription.add(this.collection.notebookDeleted$.subscribe(async () => await this.getNotebooksAndResetSelectionAsync()));

    this.subscription.add(this.collection.notesCountChanged$.subscribe((result: NotesCountResult) => {
      this.allNotesCount = result.allNotesCount;
      this.todayNotesCount = result.todayNotesCount;
      this.yesterdayNotesCount = result.yesterdayNotesCount;
      this.thisWeekNotesCount = result.thisWeekNotesCount;
      this.markedNotesCount = result.markedNotesCount;
    }));

    this.subscription.add(this.collection.noteMarkChanged$.subscribe((result: NoteMarkResult) => {
      this.zone.run(() => {
        this.markedNotesCount = result.markedNotesCount;
      });
    }));

    this.showNoteButtonSubject
      .pipe(debounceTime(700))
      .subscribe((_) => {
        this.showNoteButtons();
      });
  }

  public setSelectedNotebooks(notebook: Notebook, event: MouseEvent = null): void {
    if (event && event.ctrlKey) {
      // CTRL is pressed: add item to, or remove item from selection
      this.selectionWatcher.toggleItemSelection(notebook);
    } else if (event && event.shiftKey) {
      // SHIFT is pressed: select a range of items
      this.selectionWatcher.selectItemsRange(notebook);
    } else {
      // No modifier key is pressed: select only 1 item
      this.selectionWatcher.selectSingleItem(notebook);
    }

    if (this.selectionWatcher.selectedItemsCount > 0) {
      // If no notebook is selected, keep the current notebook active.
      this.activeNotebook = this.selectionWatcher.selectedItems[0];
    }

    this.zone.run(() => {
      this.canRenameNotebook = this.selectionWatcher.selectedItemsCount === 1 && !this.selectionWatcher.selectedItems[0].isDefault;
      this.canDeleteNotebooks = this.selectionWatcher.selectedItemsCount > 1 ||
      (this.selectionWatcher.selectedItemsCount === 1 &&
        !this.selectionWatcher.selectedItems[0].isDefault);
    });
  }

  public async addNotebookAsync(): Promise<void> {
    const titleText: string = await this.translator.getAsync('DialogTitles.AddNotebook');
    const placeholderText: string = await this.translator.getAsync('Input.NotebookName');

    const dialogRef: MatDialogRef<InputDialogComponent> = this.dialog.open(InputDialogComponent, {
      width: '450px', data: { titleText: titleText, placeholderText: placeholderText }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        const notebookName: string = dialogRef.componentInstance.inputText;

        const operation: Operation = this.collection.addNotebook(notebookName);

        switch (operation) {
          case Operation.Duplicate: {
            this.snackBar.duplicateNotebookAsync(notebookName);
            break;
          }
          case Operation.Error: {
            const errorText: string = await this.translator.getAsync('ErrorTexts.AddNotebookError', { notebookName: notebookName });
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

  public renameNotebook(): void {
    const dialogRef: MatDialogRef<RenameNotebookDialogComponent> = this.dialog.open(RenameNotebookDialogComponent, {
      width: '450px', data: { notebookId: this.activeNotebook.id }
    });
  }

  public async deleteNotebooksAsync(): Promise<void> {
    // Assume multiple selected notebooks
    let title: string = await this.translator.getAsync('DialogTitles.ConfirmDeleteNotebooks');
    let text: string = await this.translator.getAsync('DialogTexts.ConfirmDeleteNotebooks');

    if (this.selectionWatcher.selectedItemsCount === 1) {
      title = await this.translator.getAsync('DialogTitles.ConfirmDeleteNotebook');
      text = await this.translator.getAsync(
        'DialogTexts.ConfirmDeleteNotebook',
        { notebookName: this.selectionWatcher.selectedItems[0].name });
    }

    const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {

      width: '450px', data: { dialogTitle: title, dialogText: text }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        const operation: Operation = await this.collection.deleteNotebooksAsync(this.selectionWatcher.selectedItems.map(x => x.id));

        if (operation === Operation.Error) {
          const errorText: string = (await this.translator.getAsync('ErrorTexts.DeleteNotebooksError'));
          this.dialog.open(ErrorDialogComponent, {
            width: '450px', data: { errorText: errorText }
          });
        }
      }
    });
  }

  public onNotesCountChanged(notesCount: number): void {
    this.notesCount = notesCount;
  }

  public async addNoteAsync(): Promise<void> {
    const baseTitle: string = await this.translator.getAsync('Notes.NewNote');

    // Create a new note
    const result: NoteOperationResult = this.collection.addNote(baseTitle, this.activeNotebook.id);

    if (result.operation === Operation.Success) {
      this.globalEmitter.emit(Constants.setNoteOpenEvent, result.noteId, true);
    }
  }

  public async deleteNotesAsync(): Promise<void> {
    // Assume multiple selected notes
    let title: string = await this.translator.getAsync('DialogTitles.ConfirmDeleteNotes');
    let text: string = await this.translator.getAsync('DialogTexts.ConfirmDeleteNotes');

    if (!this.selectedNoteIds || this.selectedNoteIds.length === 0) {
      // This situation should not happen
      this.logger.warn('User requested to delete notes, but there are not selected notes.', 'CollectionComponent', 'deleteNotesAsync');
      return;
    }

    if (this.selectedNoteIds.length === 1) {
      const note: Note = await this.collection.getNote(this.selectedNoteIds[0]);
      title = await this.translator.getAsync('DialogTitles.ConfirmDeleteNote');
      text = await this.translator.getAsync('DialogTexts.ConfirmDeleteNote', { noteTitle: note.title });
    }

    const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {

      width: '450px', data: { dialogTitle: title, dialogText: text }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        for (const selectedNoteId of this.selectedNoteIds) {
          // Close the note window
          if (this.collection.noteIsOpen(selectedNoteId)) {
            this.globalEmitter.emit(Constants.closeNoteEvent, selectedNoteId);
          }
        }

        // Delete the notes
        const operation: Operation = await this.collection.deleteNotesAsync(this.selectedNoteIds);

        if (operation === Operation.Error) {
          const errorText: string = (await this.translator.getAsync('ErrorTexts.DeleteNotesError'));
          this.dialog.open(ErrorDialogComponent, {
            width: '450px', data: { errorText: errorText }
          });
        }
      }
    });
  }

  public onSelectedNotesChanged(selectedNoteIds: string[]): void {
    this.selectedNoteIds = selectedNoteIds;
    this.canDeleteNotes = this.selectedNoteIds != null && this.selectedNoteIds.length > 0;
  }

  public async importNotesAsync(): Promise<void> {
    const selectedFiles: string[] = remote.dialog.showOpenDialog({
      filters: [
        { name: Constants.applicationName, extensions: [Constants.noteExportExtension.replace('.', '')] },
        { name: await this.translator.getAsync('DialogTexts.AllFiles'), extensions: ['*'] }
      ],
      properties: ['openFile', 'multiSelections']
    });

    if (selectedFiles) {
      await this.importNoteFilesAsync(selectedFiles, this.activeNotebook);
    }
  }

  public onSelectedTabChange(event: MatTabChangeEvent): void {
    this.hideNoteButtons();
    const tabIndex: number = event.index;
    let category: string = '';

    if (tabIndex === 0) {
      category = Constants.allCategory;
    } else if (tabIndex === 1) {
      category = Constants.todayCategory;
    } else if (tabIndex === 2) {
      category = Constants.yesterdayCategory;
    } else if (tabIndex === 3) {
      category = Constants.thisWeekCategory;
    } else if (tabIndex === 4) {
      category = Constants.markedCategory;
    }

    this.tabChangedSubject.next(category);
    this.showNoteButtonSubject.next('');
  }

  private hideNoteButtons(): void {
    this.noteButtonsVisibility = 'hidden';
  }

  private showNoteButtons(): void {
    this.noteButtonsVisibility = 'visible';
  }

  private async getNotebooksAsync(): Promise<void> {
    this.notebooks = await this.collection.getNotebooksAsync(true);
    this.selectionWatcher.reset(this.notebooks, true);

    // Set 1st notebook active by default
    this.activeNotebook = this.selectionWatcher.selectedItems[0];
    this.notebooksCount = this.notebooks.length - 2;
  }

  private async getNotebooksAndResetSelectionAsync(): Promise<void> {
    await this.getNotebooksAsync();
  }

  public notebookDragOver(event: any, notebook: Notebook): void {
    event.preventDefault();
    this.hoveredNotebook = notebook;
  }

  public notebookDragLeave(event: any): void {
    event.preventDefault();
    this.hoveredNotebook = null;
  }

  public async notebookDrop(event: any, notebook: Notebook): Promise<void> {
    event.preventDefault();
    this.hoveredNotebook = null;

    if (this.file.isDroppingFiles(event)) {
      // Dropping files
      const pathsOfDroppedFiles: string[] = this.file.getDroppedFilesPaths(event);
      await this.importNoteFilesAsync(pathsOfDroppedFiles, notebook);
    } else {
      const noteIds: string[] = JSON.parse(event.dataTransfer.getData('text'));
      const operation: Operation = this.collection.setNotebook(notebook.id, noteIds);

      if (operation === Operation.Success) {
        if (noteIds.length > 1) {
          this.snackBar.notesMovedToNotebookAsync(notebook.name);
        } else {
          this.snackBar.noteMovedToNotebookAsync(notebook.name);
        }
      } else if (operation === Operation.Error) {
        const errorText: string = (await this.translator.getAsync('ErrorTexts.ChangeNotebookError'));

        this.dialog.open(ErrorDialogComponent, {
          width: '450px', data: { errorText: errorText }
        });
      }
    }
  }

  public async notesDrop(event: any): Promise<void> {
    event.preventDefault();
    const droppedFilesPaths: string[] = this.file.getDroppedFilesPaths(event);

    if (this.file.isDroppingFiles(event)) {
      // Dropping files
      const pathsOfDroppedFiles: string[] = this.file.getDroppedFilesPaths(event);
      await this.importNoteFilesAsync(pathsOfDroppedFiles, this.activeNotebook);
    }
  }

  public notesDragOver(event: any): void {
    event.preventDefault();
  }

  private async importNoteFilesAsync(filePaths: string[], notebook: Notebook): Promise<void> {
    const noteFilePaths: string[] = this.file.getNoteFilePaths(filePaths);

    if (noteFilePaths.length === 0) {
      await this.snackBar.noNoteFilesToImportAsync();
      return;
    }

    const importOperation: Operation = await this.collection.importNoteFilesAsync(noteFilePaths, notebook.id);

    if (importOperation === Operation.Success) {
      await this.snackBar.notesImportedIntoNotebookAsync(notebook.name);
    } else if (importOperation === Operation.Error) {
      const errorText: string = (await this.translator.getAsync('ErrorTexts.ImportNotesError'));

      this.dialog.open(ErrorDialogComponent, {
        width: '450px', data: { errorText: errorText }
      });
    }
  }
}
