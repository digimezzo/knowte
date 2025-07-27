import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Subscription} from 'rxjs';
import {Constants} from '../../common/application/constants';
import {Logger} from '../../common/logging/logger';
import {BaseSettings} from '../../common/settings/base-settings';
import {SelectionWatcher} from '../../common/ui/selection-watcher';
import {Note} from '../../data/entities/note';
import {Notebook} from '../../data/entities/notebook';
import {CollectionService} from '../../services/collection/collection.service';
import {NoteMarkResult} from '../../services/results/note-mark-result';
import {NotePinResult} from '../../services/results/note-pin-result';
import {SearchService} from '../../services/search/search.service';

@Component({
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NotesComponent implements OnInit, OnDestroy {
    private _category: string;
    
    
    private subscription: Subscription;
    private _activeNotebook: Notebook;
    private selectionWatcher: SelectionWatcher = new SelectionWatcher();

    public constructor(
        public searchService: SearchService,
        private collectionService: CollectionService,
        private settings: BaseSettings,
        private logger: Logger,
    ) {
    }

    
    public get category(): string {
        return this._category;
    }

    @Input()
    public set category(value: string) {
        this._category = value;
        this.getNotesAsync();
    }

    public get activeNotebook(): Notebook {
        return this._activeNotebook;
    }

    @Input()
    public set activeNotebook(val: Notebook) {
        this._activeNotebook = val;
        this.getNotesAsync();
    }

    @Output()
    public notesCount: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    public selectedNoteIds: EventEmitter<string[]> = new EventEmitter<string[]>();

    public notes: Note[] = [];
    public draggableNoteIds: string[] = [];
    public draggedNote: Note;

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public async ngOnInit(): Promise<void> {
        // Workaround for auto reload
        await this.collectionService.initializeAsync();

        this.subscription = this.collectionService.noteEdited$.subscribe(async () => await this.getNotesAsync());
        this.subscription.add(this.collectionService.notesChanged$.subscribe(async () => await this.getNotesAsync()));
        this.subscription.add(this.collectionService.noteNotebookChanged$.subscribe(async () => await this.getNotesAsync()));
        this.subscription.add(this.searchService.searchTextChanged$.subscribe(async (_) => await this.getNotesAsync()));

        this.subscription.add(
            this.collectionService.noteMarkChanged$.subscribe(async (result: NoteMarkResult) => {
                if (this._category === Constants.markedCategory) {
                    await this.getNotesAsync();
                } else {
                    this.markNote(result);
                }
            })
        );

        this.subscription.add(
            this.collectionService.notePinChanged$.subscribe(async (result: NotePinResult) => {
                await this.getNotesAsync();
            })
        );

        await this.getNotesAsync();
    }

    public setSelectedNotes(note: Note, event: MouseEvent = null): void {
        if (event && event.ctrlKey) {
            // CTRL is pressed: add item to, or remove item from selection
            this.selectionWatcher.toggleItemSelection(note);
        } else if (event && event.shiftKey) {
            // SHIFT is pressed: select a range of items
            this.selectionWatcher.selectItemsRange(note);
        } else {
            // No modifier key is pressed: select only 1 item
            this.selectionWatcher.selectSingleItem(note);
        }

        this.selectedNoteIds.next(this.getSelectedNoteIds());
    }

    public async openNoteAsync(note: Note): Promise<void> {
        if (!this.collectionService.noteIsOpen(note.id)) {
            this.logger.info(`Opening note with id=${note.id}`, 'NotesComponent', 'openNoteAsync');
            await this.collectionService.setNoteOpenAsync(note.id, true);
        } else {
            this.logger.info(`Note with id=${note.id} is already open. Focusing.`, 'NotesComponent', 'openNoteAsync');
            this.collectionService.onFocusNote(note.id);
        }
    }

    public toggleNoteMark(note: Note): void {
        this.collectionService.setNoteMark(note.id, !note.isMarked);
    }

    private markNote(result: NoteMarkResult): void {
        if (this.notes.length > 0) {
            const noteToMark: Note = this.notes.find((x) => x.id === result.noteId);

            if (noteToMark) {
                noteToMark.isMarked = result.isMarked;
            }
        }
    }

    private async getNotesAsync(): Promise<void> {
        if (this.activeNotebook) {
            // setTimeout avoids ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(async () => {
                this.notes = await this.collectionService.getNotesAsync(
                    this.activeNotebook.id,
                    this._category,
                    this.settings.showExactDatesInTheNotesList
                );
                this.selectionWatcher.reset(this.notes);
                this.notesCount.emit(this.notes.length);
            }, 0);
        }
    }

    public getSelectedNoteIds(): string[] {
        return this.notes.filter((x) => x.isSelected).map((x) => x.id);
    }

    public dragStart(event: any, draggedNote: Note): void {
        this.draggedNote = draggedNote;
        this.draggableNoteIds = this.getSelectedNoteIds();

        if (!this.draggableNoteIds.includes(draggedNote.id)) {
            this.draggableNoteIds.push(draggedNote.id);
        }

        event.dataTransfer.setDragImage(document.getElementById('drag-image'), -10, -10);
        event.dataTransfer.setData('text', JSON.stringify(this.draggableNoteIds));
    }
}
