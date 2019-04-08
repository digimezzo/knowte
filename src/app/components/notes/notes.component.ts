import { Component, OnInit, Input, OnDestroy, NgZone, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { Note } from '../../data/entities/note';
import { Subscription, Subject, fromEvent } from 'rxjs';
import { SnackBarService } from '../../services/snackBar.service';
import { Notebook } from '../../data/entities/notebook';
import { MatDialog } from '@angular/material';
import { Constants } from '../../core/constants';
import { SearchService } from '../../services/search.service';
import { NoteMarkResult } from '../../services/results/noteMarkResult';
import { debounceTime, takeUntil } from 'rxjs/internal/operators';
import { Utils } from '../../core/utils';
import { remote } from 'electron';
import log from 'electron-log';
import { SettingsService } from '../../services/settings.service';
import { FileService } from '../../services/file.service';

@Component({
    selector: 'notes-component',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NotesComponent implements OnInit, OnDestroy {
    private globalEmitter = remote.getGlobal('globalEmitter');
    private subscription: Subscription;
    private readonly destroy$ = new Subject();
    private _selectedNotebook: Notebook;

    constructor(private dialog: MatDialog, private collectionService: CollectionService, private snackBarService: SnackBarService,
        public searchService: SearchService, private settingsService: SettingsService, private fileService: FileService, private zone: NgZone) {
    }

    @Input()
    public categoryChangedSubject: Subject<string>;

    @Input()
    public componentCategory: string;

    public selectedCategory: string = Constants.allCategory;

    public get selectedNotebook(): Notebook {
        return this._selectedNotebook;
    }

    @Input()
    public set selectedNotebook(val: Notebook) {
        this._selectedNotebook = val;
        this.getNotes(false);
    }

    @Output()
    public notesCount: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    public selectedNoteIds: EventEmitter<string[]> = new EventEmitter<string[]>();

    public notes: Note[] = [];
    public draggedNote: Note;
    public canShowList: boolean = true;

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }

    public async ngOnInit(): Promise<void> {
        // Workaround for auto reload
        await this.collectionService.initializeAsync();

        this.subscription = this.collectionService.noteEdited$.subscribe(() => this.getNotes(false));
        this.subscription = this.collectionService.noteDeleted$.subscribe(() => this.getNotes(true));
        this.subscription.add(this.collectionService.noteNotebookChanged$.subscribe(() => this.getNotes(true)));
        this.subscription.add(this.searchService.searchTextChanged$.subscribe((_) => this.getNotes(false)));

        this.subscription.add(this.collectionService.noteMarkChanged$.subscribe((result: NoteMarkResult) => {
            if (this.componentCategory === Constants.markedCategory) {
                this.getNotes(false);
            } else {
                this.markNote(result);
            }
        }));

        this.subscription.add(this.categoryChangedSubject.subscribe(async (selectedCategory: string) => {
            this.selectedCategory = selectedCategory;
            await this.refreshVirtuallScrollerAsync();
            this.getNotes(false);
        }));

        fromEvent(window, 'resize')
            .pipe(
                debounceTime(10),
                takeUntil(this.destroy$),
            )
            .subscribe(() => this.zone.run(async () => {
                await this.refreshVirtuallScrollerAsync();
            }));
        ;
    }

    public setSelectedNote(note: Note, event: MouseEvent = null) {
        this.zone.run(() => {
            if (event && event.ctrlKey) {
                // CTRL is pressed: add note to or remove from selection
                note.isSelected = !note.isSelected;
            } else if (event && event.shiftKey) {
                // SHIFT is pressed: select a range
            } else {
                // No modifier key is pressed: clear previous selection
                for (let collectionNote of this.notes) {
                    note.isSelected = false;

                    if (collectionNote.id === note.id) {
                        note.isSelected = true;
                    }
                }
            }

            this.selectedNoteIds.next(this.getSelectedNoteIds());
        });
    }

    public openNote(note: Note): void {
        if (!this.collectionService.noteIsOpen(note.id)) {
            this.globalEmitter.emit(Constants.setNoteOpenEvent, note.id, true);
        } else {
            this.globalEmitter.emit(Constants.focusNoteEvent, note.id);
        }
    }

    public toggleNoteMark(note: Note): void {
        this.collectionService.setNoteMark(note.id, !note.isMarked);
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
            let noteToMark: Note = this.notes.find(x => x.id === result.noteId);

            if (noteToMark) {
                noteToMark.isMarked = result.isMarked;
            }
        }
    }

    private getNotes(resetSelection: boolean): void {
        // Only fetch notes list for selected category
        if (this.componentCategory !== this.selectedCategory) {
            return;
        }

        if (this.selectedNotebook) {
            this.zone.run(async () => {
                this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id, this.componentCategory, this.settingsService.showExactDatesInTheNotesList);
                this.notesCount.emit(this.notes.length);

                if (resetSelection) {
                    this.selectFirstNote();
                }

                this.selectedNoteIds.next(this.getSelectedNoteIds());
            });
        }
    }

    private getSelectedNoteIds() {
        return this.notes.filter(x => x.isSelected).map(x => x.id);
    }

    private selectFirstNote() {
        if (this.notes && this.notes.length > 0) {
            this.setSelectedNote(this.notes[0]);
        } else {
            this.setSelectedNote(null);
        }
    }

    public dragStart(event: any, note: Note): void {
        this.draggedNote = note;
        event.dataTransfer.setDragImage(document.getElementById('drag-image'), -10, -10);
        event.dataTransfer.setData('text', note.id);
    }
}
