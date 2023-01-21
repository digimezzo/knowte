import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import * as remote from '@electron/remote';
import { SplitAreaDirective, SplitComponent } from 'angular-split';
import { OpenDialogReturnValue } from 'electron';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators';
import { BaseSettings } from '../../core/base-settings';
import { Constants } from '../../core/constants';
import { Operation } from '../../core/enums';
import { Logger } from '../../core/logger';
import { ProductInformation } from '../../core/product-information';
import { SelectionWatcher } from '../../core/selection-watcher';
import { Note } from '../../data/entities/note';
import { Notebook } from '../../data/entities/notebook';
import { AppearanceService } from '../../services/appearance/appearance.service';
import { CollectionService } from '../../services/collection/collection.service';
import { FileService } from '../../services/file/file.service';
import { NoteMarkResult } from '../../services/results/note-mark-result';
import { NoteOperationResult } from '../../services/results/note-operation-result';
import { NotesCountResult } from '../../services/results/notes-count-result';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { UpdateService } from '../../services/update/update.service';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
import { InputDialogComponent } from '../dialogs/input-dialog/input-dialog.component';
import { RenameNotebookDialogComponent } from '../dialogs/rename-notebook-dialog/rename-notebook-dialog.component';

@Component({
    selector: 'app-collection',
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('noteButtonsVisibility', [
            state(
                'visible',
                style({
                    opacity: 1,
                })
            ),
            state(
                'hidden',
                style({
                    opacity: 0,
                })
            ),
            transition('hidden => visible', animate('.25s')),
            transition('visible => hidden', animate('.05s')),
        ]),
    ],
})
export class CollectionComponent implements OnInit, OnDestroy {
    private subscription: Subscription;

    constructor(
        public appearanceService: AppearanceService,
        private collectionService: CollectionService,
        private translatorService: TranslatorService,
        private snackBarService: SnackBarService,
        private updateService: UpdateService,
        private fileService: FileService,
        private settings: BaseSettings,
        private dialog: MatDialog,
        private logger: Logger,
        private zone: NgZone
    ) {}

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

    @ViewChild('split', { static: false }) public split: SplitComponent;
    @ViewChild('area1', { static: false }) public area1: SplitAreaDirective;

    public area1Size: number = this.settings.notebooksPaneWidth;

    public selectedIndex: number;

    public applicationName: string = ProductInformation.applicationName;
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

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public async ngOnInit(): Promise<void> {
        // Workaround for auto reload
        await this.collectionService.initializeAsync();

        // Get notebooks
        await this.getNotebooksAsync();

        // Check for updates (don't await)
        this.updateService.checkForUpdatesAsync();

        // Subscriptions
        this.subscription = this.collectionService.notebookEdited$.subscribe(async () => await this.getNotebooksAsync());
        this.subscription.add(
            this.collectionService.notebookDeleted$.subscribe(async () => await this.getNotebooksAndResetSelectionAsync())
        );

        this.subscription.add(
            this.collectionService.notesCountChanged$.subscribe((result: NotesCountResult) => {
                this.allNotesCount = result.allNotesCount;
                this.todayNotesCount = result.todayNotesCount;
                this.yesterdayNotesCount = result.yesterdayNotesCount;
                this.thisWeekNotesCount = result.thisWeekNotesCount;
                this.markedNotesCount = result.markedNotesCount;
            })
        );

        this.subscription.add(
            this.collectionService.noteMarkChanged$.subscribe((result: NoteMarkResult) => {
                this.zone.run(() => {
                    this.markedNotesCount = result.markedNotesCount;
                });
            })
        );

        this.showNoteButtonSubject.pipe(debounceTime(700)).subscribe((_) => {
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
            this.canDeleteNotebooks =
                this.selectionWatcher.selectedItemsCount > 1 ||
                (this.selectionWatcher.selectedItemsCount === 1 && !this.selectionWatcher.selectedItems[0].isDefault);
        });
    }

    public async addNotebookAsync(): Promise<void> {
        const titleText: string = await this.translatorService.getAsync('DialogTitles.AddNotebook');
        const placeholderText: string = await this.translatorService.getAsync('Input.NotebookName');

        const data: any = { titleText: titleText, inputText: '', placeholderText: placeholderText };

        const dialogRef: MatDialogRef<InputDialogComponent> = this.dialog.open(InputDialogComponent, {
            width: '450px',
            data: data,
        });

        dialogRef.afterClosed().subscribe(async (result: any) => {
            if (result) {
                const notebookName: string = data.inputText;

                const operation: Operation = this.collectionService.addNotebook(notebookName);

                switch (operation) {
                    case Operation.Duplicate: {
                        this.snackBarService.duplicateNotebookAsync(notebookName);
                        break;
                    }
                    case Operation.Error: {
                        const errorText: string = await this.translatorService.getAsync('ErrorTexts.AddNotebookError', {
                            notebookName: notebookName,
                        });
                        this.dialog.open(ErrorDialogComponent, {
                            width: '450px',
                            data: { errorText: errorText },
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
            width: '450px',
            data: { notebookId: this.activeNotebook.id },
        });
    }

    public async deleteNotebooksAsync(): Promise<void> {
        // Assume multiple selected notebooks
        let title: string = await this.translatorService.getAsync('DialogTitles.ConfirmDeleteNotebooks');
        let text: string = await this.translatorService.getAsync('DialogTexts.ConfirmDeleteNotebooks');

        if (this.selectionWatcher.selectedItemsCount === 1) {
            title = await this.translatorService.getAsync('DialogTitles.ConfirmDeleteNotebook');
            text = await this.translatorService.getAsync('DialogTexts.ConfirmDeleteNotebook', {
                notebookName: this.selectionWatcher.selectedItems[0].name,
            });
        }

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: { dialogTitle: title, dialogText: text },
        });

        dialogRef.afterClosed().subscribe(async (result: any) => {
            if (result) {
                const operation: Operation = await this.collectionService.deleteNotebooksAsync(
                    this.selectionWatcher.selectedItems.map((x) => x.id)
                );

                if (operation === Operation.Error) {
                    const errorText: string = await this.translatorService.getAsync('ErrorTexts.DeleteNotebooksError');
                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px',
                        data: { errorText: errorText },
                    });
                }
            }
        });
    }

    public onNotesCountChanged(notesCount: number): void {
        this.notesCount = notesCount;
    }

    public async addNoteAsync(): Promise<void> {
        const baseTitle: string = await this.translatorService.getAsync('Notes.NewNote');

        // Create a new note
        const result: NoteOperationResult = this.collectionService.addNote(baseTitle, this.activeNotebook.id);

        if (result.operation === Operation.Success) {
            await this.collectionService.setNoteOpen(result.noteId, true);
        }
    }

    public async deleteNotesAsync(): Promise<void> {
        // Assume multiple selected notes
        let title: string = await this.translatorService.getAsync('DialogTitles.ConfirmDeleteNotes');
        let text: string = await this.translatorService.getAsync('DialogTexts.ConfirmDeleteNotes');

        if (!this.settings.moveDeletedNotesToTrash) {
            text = await this.translatorService.getAsync('DialogTexts.ConfirmPermanentlyDeleteNotes');
        }

        if (!this.selectedNoteIds || this.selectedNoteIds.length === 0) {
            // This situation should not happen
            this.logger.warn(
                'User requested to delete notes, but there are not selected notes.',
                'CollectionComponent',
                'deleteNotesAsync'
            );
            return;
        }

        if (this.selectedNoteIds.length === 1) {
            const note: Note = await this.collectionService.getNote(this.selectedNoteIds[0]);
            title = await this.translatorService.getAsync('DialogTitles.ConfirmDeleteNote');
            text = await this.translatorService.getAsync('DialogTexts.ConfirmDeleteNote', { noteTitle: note.title });

            if (!this.settings.moveDeletedNotesToTrash) {
                text = await this.translatorService.getAsync('DialogTexts.ConfirmPermanentlyDeleteNote', { noteTitle: note.title });
            }
        }

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: { dialogTitle: title, dialogText: text },
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                for (const selectedNoteId of this.selectedNoteIds) {
                    // Close the note window
                    if (this.collectionService.noteIsOpen(selectedNoteId)) {
                        this.collectionService.onCloseNote(selectedNoteId);
                    }
                }

                // Delete the notes
                const operation: Operation = this.collectionService.deleteNotes(this.selectedNoteIds);

                if (operation === Operation.Error) {
                    const errorText: string = await this.translatorService.getAsync('ErrorTexts.DeleteNotesError');
                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px',
                        data: { errorText: errorText },
                    });
                }
            }
        });
    }

    public onSelectedNotesChanged(selectedNoteIds: string[]): void {
        this.selectedNoteIds = selectedNoteIds;
        this.canDeleteNotes = this.selectedNoteIds != undefined && this.selectedNoteIds.length > 0;
    }

    public async importNotesAsync(): Promise<void> {
        const openDialogReturnValue: OpenDialogReturnValue = await remote.dialog.showOpenDialog({
            filters: [
                { name: ProductInformation.applicationName, extensions: [Constants.noteExportExtension.replace('.', '')] },
                { name: await this.translatorService.getAsync('DialogTexts.AllFiles'), extensions: ['*'] },
            ],
            properties: ['openFile', 'multiSelections'],
        });

        if (
            openDialogReturnValue != undefined &&
            openDialogReturnValue.filePaths != undefined &&
            openDialogReturnValue.filePaths.length > 0
        ) {
            await this.importNoteFilesAsync(openDialogReturnValue.filePaths, this.activeNotebook);
        }
    }

    public onSelectedTabChange(event: MatTabChangeEvent): void {
        // Manually trigger a window resize event. Together with CdkVirtualScrollViewportPatchDirective,
        // this will ensure that CdkVirtualScrollViewport triggers a viewport size check when the
        // selected tab is changed.
        window.dispatchEvent(new Event('resize'));

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
            const pathsOfDroppedFiles: string[] = this.fileService.getDroppedFilesPaths(event);
            await this.importNoteFilesAsync(pathsOfDroppedFiles, notebook);
        } else {
            const noteIds: string[] = JSON.parse(event.dataTransfer.getData('text'));
            const operation: Operation = this.collectionService.setNotebook(notebook.id, noteIds);

            if (operation === Operation.Success) {
                if (noteIds.length > 1) {
                    this.snackBarService.notesMovedToNotebookAsync(notebook.name);
                } else {
                    this.snackBarService.noteMovedToNotebookAsync(notebook.name);
                }
            } else if (operation === Operation.Error) {
                const errorText: string = await this.translatorService.getAsync('ErrorTexts.ChangeNotebookError');

                this.dialog.open(ErrorDialogComponent, {
                    width: '450px',
                    data: { errorText: errorText },
                });
            }
        }
    }

    public async notesDrop(event: any): Promise<void> {
        event.preventDefault();
        const droppedFilesPaths: string[] = this.fileService.getDroppedFilesPaths(event);

        if (this.fileService.isDroppingFiles(event)) {
            // Dropping files
            const pathsOfDroppedFiles: string[] = this.fileService.getDroppedFilesPaths(event);
            await this.importNoteFilesAsync(pathsOfDroppedFiles, this.activeNotebook);
        }
    }

    public notesDragOver(event: any): void {
        event.preventDefault();
    }

    private async importNoteFilesAsync(filePaths: string[], notebook: Notebook): Promise<void> {
        const noteFilePaths: string[] = this.fileService.getNoteFilePaths(filePaths);

        if (noteFilePaths.length === 0) {
            await this.snackBarService.noNoteFilesToImportAsync();
            return;
        }

        const importOperation: Operation = await this.collectionService.importNoteFilesAsync(noteFilePaths, notebook.id);

        if (importOperation === Operation.Success) {
            await this.snackBarService.notesImportedIntoNotebookAsync(notebook.name);
        } else if (importOperation === Operation.Error) {
            const errorText: string = await this.translatorService.getAsync('ErrorTexts.ImportNotesError');

            this.dialog.open(ErrorDialogComponent, {
                width: '450px',
                data: { errorText: errorText },
            });
        }
    }

    public dragEnd(event: any): void {
        this.settings.notebooksPaneWidth = event.sizes[0];
    }
}
