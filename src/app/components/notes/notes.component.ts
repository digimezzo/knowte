import { Component, OnInit, Input, OnDestroy, NgZone, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection/collection.service';
import { Note } from '../../data/entities/note';
import { Subscription, Subject, fromEvent } from 'rxjs';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { Notebook } from '../../data/entities/notebook';
import { Constants } from '../../core/constants';
import { SearchService } from '../../services/search/search.service';
import { NoteMarkResult } from '../../services/results/note-mark-result';
import { debounceTime, takeUntil } from 'rxjs/internal/operators';
import { Utils } from '../../core/utils';
import { remote } from 'electron';
import { FileService } from '../../services/file/file.service';
import { SelectionWatcher } from '../../core/selection-watcher';
import { Settings } from '../../core/settings';

@Component({
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NotesComponent implements OnInit, OnDestroy {
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private subscription: Subscription;
    private readonly destroy$:  Subject<void> = new Subject();
    private _activeNotebook: Notebook;
    private selectionWatcher: SelectionWatcher = new SelectionWatcher();

    constructor(private collection: CollectionService, private snackBar: SnackBarService,
        public search: SearchService, private settings: Settings,
        private file: FileService, private zone: NgZone) {
    }

    @Input()
    public categoryChangedSubject: Subject<string>;

    @Input()
    public componentCategory: string;

    public selectedCategory: string = Constants.allCategory;

    public get activeNotebook(): Notebook {
        return this._activeNotebook;
    }

    @Input()
    public set activeNotebook(val: Notebook) {
        this._activeNotebook = val;
        this.getNotes();
    }

    @Output()
    public notesCount: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    public selectedNoteIds: EventEmitter<string[]> = new EventEmitter<string[]>();

    public notes: Note[] = [];
    public draggableNoteIds: string[] = [];
    public draggedNote: Note;
    public canShowList: boolean = true;

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }

    public async ngOnInit(): Promise<void> {
        // Workaround for auto reload
        await this.collection.initializeAsync();

        this.subscription = this.collection.noteEdited$.subscribe(() => this.getNotes());
        this.subscription.add(this.collection.noteDeleted$.subscribe(() => this.getNotes()));
        this.subscription.add(this.collection.noteNotebookChanged$.subscribe(() => this.getNotes()));
        this.subscription.add(this.search.searchTextChanged$.subscribe((_) => this.getNotes()));

        this.subscription.add(this.collection.noteMarkChanged$.subscribe((result: NoteMarkResult) => {
            if (this.componentCategory === Constants.markedCategory) {
                this.getNotes();
            } else {
                this.markNote(result);
            }
        }));

        this.subscription.add(this.categoryChangedSubject.subscribe(async (selectedCategory: string) => {
            this.selectedCategory = selectedCategory;
            await this.refreshVirtuallScrollerAsync();
            this.getNotes();
        }));

        fromEvent(window, 'resize')
            .pipe(
                debounceTime(10),
                takeUntil(this.destroy$),
            )
            .subscribe(() => this.zone.run(async () => {
                await this.refreshVirtuallScrollerAsync();
            }));

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

    public openNote(note: Note): void {
        if (!this.collection.noteIsOpen(note.id)) {
            this.globalEmitter.emit(Constants.setNoteOpenEvent, note.id, true);
        } else {
            this.globalEmitter.emit(Constants.focusNoteEvent, note.id);
        }
    }

    public toggleNoteMark(note: Note): void {
        this.collection.setNoteMark(note.id, !note.isMarked);
    }

    private async refreshVirtuallScrollerAsync(): Promise<void> {
        // cdk-virtual-scroll-viewport doesn't resize its viewport automatically,
        // so we need to use a retarded workaround.
        this.canShowList = false;
        await Utils.sleep(50);
        this.canShowList = true;
    }

    private markNote(result: NoteMarkResult): void {
        if (this.notes.length > 0) {
            const noteToMark: Note = this.notes.find(x => x.id === result.noteId);

            if (noteToMark) {
                noteToMark.isMarked = result.isMarked;
            }
        }
    }

    private getNotes(): void {
        // Only fetch notes list for selected category
        if (this.componentCategory !== this.selectedCategory) {
            return;
        }

        if (this.activeNotebook) {
            this.zone.run(async () => {
                this.notes = await this.collection.getNotesAsync(
                    this.activeNotebook.id,
                     this.componentCategory,
                     this.settings.showExactDatesInTheNotesList);
                this.selectionWatcher.reset(this.notes);
                this.notesCount.emit(this.notes.length);

                this.selectedNoteIds.next(this.getSelectedNoteIds());
            });
        }
    }

    public getSelectedNoteIds(): string[] {
        return this.notes.filter(x => x.isSelected).map(x => x.id);
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
