import { Component, OnInit, OnDestroy, NgZone, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { Notebook } from '../../data/entities/notebook';
import { MatDialog, MatDialogRef, MatTabChangeEvent } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { InputDialogComponent } from '../dialogs/inputDialog/inputDialog.component';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';
import { SnackBarService } from '../../services/snackBar.service';
import { Subscription, Subject } from 'rxjs';
import { ConfirmationDialogComponent } from '../dialogs/confirmationDialog/confirmationDialog.component';
import { RenameNotebookDialogComponent } from '../dialogs/renameNotebookDialog/renameNotebookDialog.component';
import { Constants } from '../../core/constants';
import { Operation } from '../../core/enums';
import { NotesCountResult } from '../../services/results/notesCountResult';
import { NoteMarkResult } from '../../services/results/noteMarkResult';
import { NoteOperationResult } from '../../services/results/noteOperationResult';
import { Note } from '../../data/entities/note';
import { trigger, style, animate, state, transition } from '@angular/animations';
import { debounceTime } from "rxjs/internal/operators";
import { remote } from 'electron';
import log from 'electron-log';
import { FileService } from '../../services/file.service';
import { SelectionWatcher } from '../../core/selectionWatcher';

@Component({
  selector: 'collection-page',
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
  private globalEmitter = remote.getGlobal('globalEmitter');
  private subscription: Subscription;
  private selectionWatcher: SelectionWatcher = new SelectionWatcher();

  constructor(private dialog: MatDialog, private collectionService: CollectionService, private fileService: FileService,
    private translateService: TranslateService, private snackBarService: SnackBarService, private zone: NgZone) {
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
    await this.collectionService.initializeAsync();

    // Get notebooks
    await this.getNotebooksAsync();

    // Subscriptions
    this.subscription = this.collectionService.notebookEdited$.subscribe(async () => await this.getNotebooksAsync());
    this.subscription = this.collectionService.notebookDeleted$.subscribe(async () => await this.getNotebooksAndResetSelectionAsync());

    this.subscription.add(this.collectionService.notesCountChanged$.subscribe((result: NotesCountResult) => {
      this.allNotesCount = result.allNotesCount;
      this.todayNotesCount = result.todayNotesCount;
      this.yesterdayNotesCount = result.yesterdayNotesCount;
      this.thisWeekNotesCount = result.thisWeekNotesCount;
      this.markedNotesCount = result.markedNotesCount;
    }));

    this.subscription.add(this.collectionService.noteMarkChanged$.subscribe((result: NoteMarkResult) => {
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

  public setSelectedNotebooks(notebook: Notebook, event: MouseEvent = null) {
    if (event && event.ctrlKey) {
      // CTRL is pressed: add item to, or remove item from selection
      this.selectionWatcher.toggleItemSelection(notebook);
    } else if (event && event.shiftKey) {
      // SHIFT is pressed: select a range of items
      this.selectionWatcher.selectItemsRange(notebook);
    } else {
      // No modifier key is pressed: select only 1 item
      this.selectionWatcher.addItemToSelection(notebook);
    }

    if(this.selectionWatcher.selectedItemsCount > 0){
      // If no notebook is selected, keep the current notebook active.
      this.activeNotebook = this.selectionWatcher.selectedItems[0];
    }
    
    this.zone.run(() => {
      this.canRenameNotebook = this.selectionWatcher.selectedItemsCount === 1 && !this.selectionWatcher.selectedItems[0].isDefault;
      this.canDeleteNotebooks = this.selectionWatcher.selectedItemsCount > 1 || (this.selectionWatcher.selectedItemsCount === 1 && !this.selectionWatcher.selectedItems[0].isDefault);
    });
  }

  public async addNotebookAsync(): Promise<void> {
    let titleText: string = await this.translateService.get('DialogTitles.AddNotebook').toPromise();
    let placeholderText: string = await this.translateService.get('Input.NotebookName').toPromise();

    let dialogRef: MatDialogRef<InputDialogComponent> = this.dialog.open(InputDialogComponent, {
      width: '450px', data: { titleText: titleText, placeholderText: placeholderText }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        let notebookName: string = dialogRef.componentInstance.inputText;

        let operation: Operation = this.collectionService.addNotebook(notebookName);

        switch (operation) {
          case Operation.Duplicate: {
            this.snackBarService.duplicateNotebookAsync(notebookName);
            break;
          }
          case Operation.Error: {
            let errorText: string = (await this.translateService.get('ErrorTexts.AddNotebookError', { notebookName: notebookName }).toPromise());
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
    let dialogRef: MatDialogRef<RenameNotebookDialogComponent> = this.dialog.open(RenameNotebookDialogComponent, {
      width: '450px', data: { notebookId: this.activeNotebook.id }
    });
  }

  public async deleteNotebookAsync(): Promise<void> {
    let notebookName: string = this.collectionService.getNotebookName(this.activeNotebook.id);
    let title: string = await this.translateService.get('DialogTitles.ConfirmDeleteNotebook').toPromise();
    let text: string = await this.translateService.get('DialogTexts.ConfirmDeleteNotebook', { notebookName: notebookName }).toPromise();

    let dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {

      width: '450px', data: { dialogTitle: title, dialogText: text }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        let operation: Operation = await this.collectionService.deleteNotebookAsync(this.activeNotebook.id);

        if (operation === Operation.Error) {
          let errorText: string = (await this.translateService.get('ErrorTexts.DeleteNotebookError', { notebookName: notebookName }).toPromise());
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
    let baseTitle: string = await this.translateService.get('Notes.NewNote').toPromise();

    // Create a new note
    let result: NoteOperationResult = this.collectionService.addNote(baseTitle, this.activeNotebook.id);

    if (result.operation === Operation.Success) {
      this.globalEmitter.emit(Constants.setNoteOpenEvent, result.noteId, true);
    }
  }

  public async deleteNotesAsync(): Promise<void> {
    // Assume multiple selected notes
    let title: string = await this.translateService.get('DialogTitles.ConfirmDeleteNotes').toPromise();
    let text: string = await this.translateService.get('DialogTexts.ConfirmDeleteMultipleNotes').toPromise();

    if (!this.selectedNoteIds || this.selectedNoteIds.length === 0) {
      // This situation should not happen
      log.warn("User requested to delete notes, but there are not selected notes.");
      return;
    }

    if (this.selectedNoteIds.length === 1) {
      let note: Note = await this.collectionService.getNote(this.selectedNoteIds[0]);
      title = await this.translateService.get('DialogTitles.ConfirmDeleteNote').toPromise();
      text = await this.translateService.get('DialogTexts.ConfirmDeleteSingleNote', { noteTitle: note.title }).toPromise();
    }

    let dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {

      width: '450px', data: { dialogTitle: title, dialogText: text }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        for (let selectedNoteId of this.selectedNoteIds) {
          // Close the note window
          if (this.collectionService.noteIsOpen(selectedNoteId)) {
            this.globalEmitter.emit(Constants.closeNoteEvent, selectedNoteId);
          }
        }

        // Delete the notes
        let operation: Operation = await this.collectionService.deleteNotesAsync(this.selectedNoteIds);

        if (operation === Operation.Error) {
          let errorText: string = (await this.translateService.get('ErrorTexts.DeleteNotesError').toPromise());
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
    let selectedFiles: string[] = remote.dialog.showOpenDialog({
      filters: [
        { name: Constants.applicationName, extensions: [Constants.noteExportExtension.replace(".", "")] },
        { name: await this.translateService.get('DialogTexts.AllFiles').toPromise(), extensions: ['*'] }
      ],
      properties: ['openFile', 'multiSelections']
    });

    if (selectedFiles) {
      await this.importNoteFilesAsync(selectedFiles, this.activeNotebook);
    }
  }

  public onSelectedTabChange(event: MatTabChangeEvent): void {
    this.hideNoteButtons();
    let tabIndex: number = event.index;
    let category: string = "";

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
    this.showNoteButtonSubject.next("");
  }

  private hideNoteButtons(): void {
    this.noteButtonsVisibility = "hidden";
  }

  private showNoteButtons(): void {
    this.noteButtonsVisibility = "visible";
  }

  private async getNotebooksAsync(): Promise<void> {
    this.notebooks = await this.collectionService.getNotebooksAsync(true);
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

    if (this.fileService.isDroppingFiles(event)) {
      // Dropping files
      let pathsOfDroppedFiles: string[] = this.fileService.getDroppedFilesPaths(event);
      await this.importNoteFilesAsync(pathsOfDroppedFiles, notebook);
    } else {
      // Dropping notes (we only support dropping of 1 notes at this time)
      let noteId: string = event.dataTransfer.getData('text');
      let operation: Operation = this.collectionService.setNotebook(notebook.id, [noteId]);

      if (operation === Operation.Success) {
        this.snackBarService.noteMovedToNotebookAsync(notebook.name);
      } else if (operation === Operation.Error) {
        let errorText: string = (await this.translateService.get('ErrorTexts.ChangeNotebookError').toPromise());

        this.dialog.open(ErrorDialogComponent, {
          width: '450px', data: { errorText: errorText }
        });
      }
    }
  }

  public async notesDrop(event: any): Promise<void> {
    event.preventDefault();
    let droppedFilesPaths: string[] = this.fileService.getDroppedFilesPaths(event);

    if (this.fileService.isDroppingFiles(event)) {
      // Dropping files
      let pathsOfDroppedFiles: string[] = this.fileService.getDroppedFilesPaths(event);
      await this.importNoteFilesAsync(pathsOfDroppedFiles, this.activeNotebook);
    }
  }

  public notesDragOver(event: any): void {
    event.preventDefault();
  }

  private async importNoteFilesAsync(filePaths: string[], notebook: Notebook): Promise<void> {
    let noteFilePaths: string[] = this.fileService.getNoteFilePaths(filePaths);

    if (noteFilePaths.length === 0) {
      await this.snackBarService.noNoteFilesToImportAsync();
      return;
    }

    let importOperation: Operation = await this.collectionService.importNoteFilesAsync(noteFilePaths, notebook.id);

    if (importOperation === Operation.Success) {
      await this.snackBarService.notesImportedIntoNotebookAsync(notebook.name);
    } else if (importOperation === Operation.Error) {
      let errorText: string = (await this.translateService.get('ErrorTexts.ImportNotesError').toPromise());

      this.dialog.open(ErrorDialogComponent, {
        width: '450px', data: { errorText: errorText }
      });
    }
  }
}
