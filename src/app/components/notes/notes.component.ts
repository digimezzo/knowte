import { Component, OnInit, Input, OnDestroy, NgZone, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { Note } from '../../data/entities/note';
import { Subscription, Subject, fromEvent } from 'rxjs';
import { SnackBarService } from '../../services/snackBar.service';
import { Notebook } from '../../data/entities/notebook';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import { Constants } from '../../core/constants';
import { SearchService } from '../../services/search.service';
import { NoteMarkResult } from '../../services/results/noteMarkResult';
import { debounceTime, takeUntil } from 'rxjs/internal/operators';
import { Utils } from '../../core/utils';
import * as Store from 'electron-store';
import { remote } from 'electron';
import log from 'electron-log';

@Component({
    selector: 'notes-component',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NotesComponent implements OnInit, OnDestroy {
    constructor(private dialog: MatDialog, private collectionService: CollectionService, private snackBarService: SnackBarService,
        private translateService: TranslateService, public searchService: SearchService, private zone: NgZone) {
    }

    private globalEmitter = remote.getGlobal('globalEmitter');

    private settings: Store = new Store();
    private readonly destroy$ = new Subject();
    private _selectedNotebook: Notebook;

    private _value: string;
    public get value(): string {
        return this._value;
    }
    public set value(v: string) {
        this._value = v;
    }

    public selectedCategory: string = Constants.allCategory;

    @Input()
    public categoryChangedSubject: Subject<string>;

    @Input()
    public componentCategory: string;

    get selectedNotebook(): Notebook {
        return this._selectedNotebook;
    }

    @Input()
    set selectedNotebook(val: Notebook) {
        this._selectedNotebook = val;
        this.getNotes(false);
    }

    private subscription: Subscription;
    public notes: Note[] = [];
    public selectedNote: Note;

    @Output()
    public notesCount: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    public selectedNoteOutput: EventEmitter<Note> = new EventEmitter<Note>();

    public canShowList: boolean = true;

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }

    async ngOnInit() {
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
                this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id, this.componentCategory, this.settings.get('showExactDatesInTheNotesList'));
                this.notesCount.emit(this.notes.length);

                if(resetSelection){
                    this.selectFirstNote();
                }

                this.selectedNoteOutput.next(this.selectedNote);
            });
        }
    }

    public setSelectedNote(note: Note) {
        this.zone.run(() => {
            this.selectedNote = note;
            this.selectedNoteOutput.next(note);
        });
    }

    private selectFirstNote() {
        if (this.notes && this.notes.length > 0) {
            this.setSelectedNote(this.notes[0]);
        } else {
            this.setSelectedNote(null);
        }
    }

    public openNote(): void {
        if (!this.collectionService.noteIsOpen(this.selectedNote.id)) {
            this.globalEmitter.emit(Constants.setNoteOpenEvent, this.selectedNote.id, true);
        } else {
            this.globalEmitter.emit(Constants.focusNoteEvent, this.selectedNote.id);
        }
    }

    public toggleNoteMark(note: Note): void {
        this.collectionService.setNoteMark(note.id, !note.isMarked);
    }
}
