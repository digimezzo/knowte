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
    private dragImage: HTMLImageElement;

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
    public selectedNoteOutput: EventEmitter<Note> = new EventEmitter<Note>();

    public notes: Note[] = [];
    public selectedNote: Note;
    public draggedNote: Note;
    public canShowList: boolean = true;

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }

    public async ngOnInit(): Promise<void> {
        // Drag image
        // this.dragImage = document.createElement("img");
        // this.dragImage.src = "assets/icons/png/64x64.png";

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

    public setSelectedNote(note: Note) {
        this.zone.run(() => {
            this.selectedNote = note;
            this.selectedNoteOutput.next(note);
        });
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

                this.selectedNoteOutput.next(this.selectedNote);
            });
        }
    }

    private selectFirstNote() {
        if (this.notes && this.notes.length > 0) {
            this.setSelectedNote(this.notes[0]);
        } else {
            this.setSelectedNote(null);
        }
    }

    public drag(event: any, note: Note): void {
        //event.dataTransfer.setDragImage(this.dragImage, 0, 0);
        this.draggedNote = note;
        event.dataTransfer.setDragImage(document.getElementById('drag-image'), -10, -10);
        event.dataTransfer.setData('text', note.id);
    }

    public drop(event: any): void {
        event.preventDefault();

        let pathsOfDroppedFiles: string[] = this.fileService.getDroppedFilesPaths(event);

        // TODO
    }

    public dragOver(event: any): void {
        // Prevent default behavior (Prevent file from being opened)
        event.preventDefault();
    }
}
