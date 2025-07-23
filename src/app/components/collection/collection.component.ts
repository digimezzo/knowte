import {animate, state, style, transition, trigger} from '@angular/animations';
import {Component, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import * as remote from '@electron/remote';
import {SplitAreaDirective, SplitComponent} from 'angular-split';
import {OpenDialogReturnValue} from 'electron';
import {Subscription} from 'rxjs';
import {Constants} from '../../common/application/constants';
import {ProductInformation} from '../../common/application/product-information';
import {Operation} from '../../common/enums/operation';
import {Logger} from '../../common/logging/logger';
import {BaseSettings} from '../../common/settings/base-settings';
import {SelectionWatcher} from '../../common/ui/selection-watcher';
import {Note} from '../../data/entities/note';
import {Notebook} from '../../data/entities/notebook';
import {BaseAppearanceService} from '../../services/appearance/base-appearance.service';
import {CollectionService} from '../../services/collection/collection.service';
import {FileService} from '../../services/file/file.service';
import {NoteMarkResult} from '../../services/results/note-mark-result';
import {NotesCountResult} from '../../services/results/notes-count-result';
import {SnackBarService} from '../../services/snack-bar/snack-bar.service';
import {TranslatorService} from '../../services/translator/translator.service';
import {UpdateService} from '../../services/update/update.service';
import {ConfirmationDialogComponent} from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import {ErrorDialogComponent} from '../dialogs/error-dialog/error-dialog.component';
import {InputDialogComponent} from '../dialogs/input-dialog/input-dialog.component';
import {RenameNotebookDialogComponent} from '../dialogs/rename-notebook-dialog/rename-notebook-dialog.component';
import {MoveNotesBottomSheetComponent} from './bottom-sheets/move-notes-bottom-sheet/move-notes-bottom-sheet.component';
import {NoteCreator} from './note-creator';
import {
    NoteTypeChooserBottomSheetComponent
} from './note-type-chooser-bottom-sheet/note-type-chooser-bottom-sheet.component';
import {AnimatedPage} from "../animated-page";

@Component({
    selector: 'app-collection',
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CollectionComponent extends AnimatedPage implements OnInit, OnDestroy {
    private subscription: Subscription;

    public constructor(
        public appearance: BaseAppearanceService,
        private collection: CollectionService,
        private translator: TranslatorService,
        private snackBar: SnackBarService,
        private update: UpdateService,
        private file: FileService,
        private bottomSheet: MatBottomSheet,
        private noteCreator: NoteCreator,
        private settings: BaseSettings,
        private dialog: MatDialog,
        private logger: Logger,
        private zone: NgZone
    ) {
        super();
    }
    
    public category: string = Constants.allCategory;

    @ViewChild('split', {static: false}) public split: SplitComponent;
    @ViewChild('area1', {static: false}) public area1: SplitAreaDirective;

    public area1Size: number = this.settings.notebooksPaneWidth;

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
    public selectedNoteIds: string[];
    public notesCount: number = 0;
    public hasSelectedNotes: boolean = false;
    public isBusy: boolean = false;
    public canRenameNotebook: boolean = false;
    public canDeleteNotebooks: boolean = false;
    public selectionWatcher: SelectionWatcher = new SelectionWatcher();

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public async ngOnInit(): Promise<void> {
        // Workaround for auto reload
        await this.collection.initializeAsync();

        // Get notebooks
        await this.getNotebooksAsync();

        // Check for updates (don't await)
        this.update.checkForUpdatesAsync();

        // Subscriptions
        this.subscription = this.collection.notebookEdited$.subscribe(async () => await this.getNotebooksAsync());
        this.subscription.add(this.collection.notebookDeleted$.subscribe(async () => await this.getNotebooksAndResetSelectionAsync()));

        this.subscription.add(
            this.collection.notesCountChanged$.subscribe((result: NotesCountResult) => {
                this.allNotesCount = result.allNotesCount;
                this.todayNotesCount = result.todayNotesCount;
                this.yesterdayNotesCount = result.yesterdayNotesCount;
                this.thisWeekNotesCount = result.thisWeekNotesCount;
                this.markedNotesCount = result.markedNotesCount;
            })
        );

        this.subscription.add(
            this.collection.noteMarkChanged$.subscribe((result: NoteMarkResult) => {
                this.zone.run(() => {
                    this.markedNotesCount = result.markedNotesCount;
                });
            })
        );
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
        const titleText: string = await this.translator.getAsync('DialogTitles.AddNotebook');
        const placeholderText: string = await this.translator.getAsync('Input.NotebookName');

        const data: any = {titleText: titleText, inputText: '', placeholderText: placeholderText};

        const dialogRef: MatDialogRef<InputDialogComponent> = this.dialog.open(InputDialogComponent, {
            width: '450px',
            data: data,
        });

        const result: any = await dialogRef.afterClosed().toPromise();

        if (result) {
            const notebookName: string = data.inputText;
            const operation: Operation = this.collection.addNotebook(notebookName);

            switch (operation) {
                case Operation.Duplicate: {
                    this.snackBar.duplicateNotebookAsync(notebookName);
                    break;
                }
                case Operation.Error: {
                    const errorText: string = await this.translator.getAsync('ErrorTexts.AddNotebookError', {
                        notebookName: notebookName,
                    });
                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px',
                        data: {errorText: errorText},
                    });
                    break;
                }
                default: {
                    // Other cases don't need handling
                    break;
                }
            }
        }
    }

    public renameNotebook(): void {
        const dialogRef: MatDialogRef<RenameNotebookDialogComponent> = this.dialog.open(RenameNotebookDialogComponent, {
            width: '450px',
            data: {notebookId: this.activeNotebook.id},
        });
    }

    public async deleteNotebooksAsync(): Promise<void> {
        // Assume multiple selected notebooks
        let title: string = await this.translator.getAsync('DialogTitles.ConfirmDeleteNotebooks');
        let text: string = await this.translator.getAsync('DialogTexts.ConfirmDeleteNotebooks');

        if (this.selectionWatcher.selectedItemsCount === 1) {
            title = await this.translator.getAsync('DialogTitles.ConfirmDeleteNotebook');
            text = await this.translator.getAsync('DialogTexts.ConfirmDeleteNotebook', {
                notebookName: this.selectionWatcher.selectedItems[0].name,
            });
        }

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: {dialogTitle: title, dialogText: text},
        });

        const result: any = await dialogRef.afterClosed().toPromise();

        if (result) {
            const operation: Operation = await this.collection.deleteNotebooksAsync(this.selectionWatcher.selectedItems.map((x) => x.id));

            if (operation === Operation.Error) {
                const errorText: string = await this.translator.getAsync('ErrorTexts.DeleteNotebooksError');
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px',
                    data: {errorText: errorText},
                });
            }
        }
    }

    public onNotesCountChanged(notesCount: number): void {
        this.notesCount = notesCount;
    }

    public async deleteNotesAsync(): Promise<void> {
        // Assume multiple selected notes
        let title: string = await this.translator.getAsync('DialogTitles.ConfirmDeleteNotes');
        let text: string = await this.translator.getAsync('DialogTexts.ConfirmDeleteNotes');

        if (!this.settings.moveDeletedNotesToTrash) {
            text = await this.translator.getAsync('DialogTexts.ConfirmPermanentlyDeleteNotes');
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
            const note: Note = await this.collection.getNote(this.selectedNoteIds[0]);
            title = await this.translator.getAsync('DialogTitles.ConfirmDeleteNote');
            text = await this.translator.getAsync('DialogTexts.ConfirmDeleteNote', {noteTitle: note.title});

            if (!this.settings.moveDeletedNotesToTrash) {
                text = await this.translator.getAsync('DialogTexts.ConfirmPermanentlyDeleteNote', {noteTitle: note.title});
            }
        }

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: {dialogTitle: title, dialogText: text},
        });

        const result: any = await dialogRef.afterClosed().toPromise();

        if (result) {
            for (const selectedNoteId of this.selectedNoteIds) {
                // Close the note window
                if (this.collection.noteIsOpen(selectedNoteId)) {
                    this.collection.onCloseNote(selectedNoteId);
                }
            }

            // Delete the notes
            const operation: Operation = await this.collection.deleteNotesAsync(this.selectedNoteIds);

            if (operation === Operation.Error) {
                const errorText: string = await this.translator.getAsync('ErrorTexts.DeleteNotesError');
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px',
                    data: {errorText: errorText},
                });
            }
        }
    }

    public onSelectedNotesChanged(selectedNoteIds: string[]): void {
        this.selectedNoteIds = selectedNoteIds;
        this.hasSelectedNotes = this.selectedNoteIds != undefined && this.selectedNoteIds.length > 0;
    }

    public async importNotesAsync(): Promise<void> {
        const openDialogReturnValue: OpenDialogReturnValue = await remote.dialog.showOpenDialog({
            filters: [
                {
                    name: ProductInformation.applicationName,
                    extensions: [
                        Constants.classicNoteExportExtension.replace('.', ''),
                        Constants.markdownNoteExportExtension.replace('.', ''),
                    ],
                },
                {name: await this.translator.getAsync('DialogTexts.AllFiles'), extensions: ['*']},
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
                const errorText: string = await this.translator.getAsync('ErrorTexts.ChangeNotebookError');

                this.dialog.open(ErrorDialogComponent, {
                    width: '450px',
                    data: {errorText: errorText},
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
            const errorText: string = await this.translator.getAsync('ErrorTexts.ImportNotesError');

            this.dialog.open(ErrorDialogComponent, {
                width: '450px',
                data: {errorText: errorText},
            });
        }
    }

    public dragEnd(event: any): void {
        this.settings.notebooksPaneWidth = event.sizes[0];
    }

    public openMoveNotesBottomSheet(): void {
        this.bottomSheet.open(MoveNotesBottomSheetComponent, {
            data: {selectedNoteIds: this.selectedNoteIds},
        });
    }

    public async addNoteAsync(): Promise<void> {
        if (this.settings.canCreateClassicNotes && this.settings.canCreateMarkdownNotes) {
            this.bottomSheet.open(NoteTypeChooserBottomSheetComponent, {
                data: {activeNotebookId: this.activeNotebook.id},
            });
        } else if (this.settings.canCreateClassicNotes) {
            await this.noteCreator.createClassicNoteAsync(this.activeNotebook.id);
        } else if (this.settings.canCreateMarkdownNotes) {
            await this.noteCreator.createMarkdownNoteAsync(this.activeNotebook.id);
        }
    }

    public override setPage(page: number): void {
        this.previousPage = this.page;
        this.page = page;

        if (page === 0) {
            this.category = Constants.allCategory;
        } else if (page === 1) {
            this.category = Constants.todayCategory;
        } else if (page === 2) {
            this.category = Constants.yesterdayCategory;
        } else if (page === 3) {
            this.category = Constants.thisWeekCategory;
        } else if (page === 4) {
            this.category = Constants.markedCategory;
        }
    }
}
