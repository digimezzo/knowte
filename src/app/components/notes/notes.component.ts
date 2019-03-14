import { Component, OnInit, Input, OnDestroy, NgZone } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { Note } from '../../data/entities/note';
import { Subscription, Subject, fromEvent } from 'rxjs';
import { SnackBarService } from '../../services/snackBar.service';
import { ipcRenderer } from 'electron';
import { Notebook } from '../../data/entities/notebook';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../dialogs/confirmationDialog/confirmationDialog.component';
import { MatDialogRef, MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';
import { Constants } from '../../core/constants';
import { Operation } from '../../core/enums';
import { NoteOperationResult } from '../../services/results/noteOperationResult';
import { SearchService } from '../../services/search.service';
import { NoteMarkResult } from '../../services/results/noteMarkResult';
import { debounceTime, takeUntil } from 'rxjs/internal/operators';
import { Utils } from '../../core/utils';

@Component({
    selector: 'notes-component',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit, OnDestroy {
    constructor(private dialog: MatDialog, private collectionService: CollectionService, private snackBarService: SnackBarService,
        private translateService: TranslateService, public searchService: SearchService, private zone: NgZone) {
    }

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
        this.getNotes();
    }

    private subscription: Subscription;
    public notes: Note[] = [];
    public selectedNote: Note;
    public notesCount: number = 0;
    public canEditNote: boolean = false;

    public canShowList: boolean = true;

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }

    async ngOnInit() {
        // Workaround for auto reload
        await this.collectionService.initializeAsync();

        this.subscription = this.collectionService.noteEdited$.subscribe(() => this.getNotes());
        this.subscription = this.collectionService.noteDeleted$.subscribe(() => this.getNotesAndResetSelection());
        this.subscription.add(this.collectionService.noteNotebookChanged$.subscribe(() => this.getNotesAndResetSelection()));
        this.subscription.add(this.searchService.searchTextChanged$.subscribe((_) => this.getNotes()));

        this.subscription.add(this.collectionService.noteMarkChanged$.subscribe((result: NoteMarkResult) => {
            if (this.componentCategory === Constants.markedCategory) {
                this.getNotes();
            } else {
                this.markNote(result);
            }
        }));

        this.subscription.add(this.categoryChangedSubject.subscribe(async (selectedCategory: string) => {
            this.selectedCategory = selectedCategory;
            this.refreshVirtuallScrollerAsync();
            this.getNotes();
        }));

        fromEvent(window, 'resize')
            .pipe(
                debounceTime(10),
                takeUntil(this.destroy$),
            )
            .subscribe(async () => this.zone.run(() => {
                this.refreshVirtuallScrollerAsync();
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

    private getNotes(): void {
        // Only fetch notes list for selected category
        if (this.componentCategory !== this.selectedCategory) {
            return;
        }

        if (this.selectedNotebook) {
            this.zone.run(async () => {
                this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id, this.componentCategory, true);
                this.notesCount = this.notes.length;
            });
        }
    }

    private getNotesAndResetSelection(): void {
        this.getNotes();
        this.selectFirstNote();
    }

    public setSelectedNote(note: Note) {
        this.zone.run(() => {
            this.selectedNote = note;
            this.canEditNote = this.selectedNote != null;
        });
    }

    public selectFirstNote() {
        if (this.notes && this.notes.length > 0) {
            this.setSelectedNote(this.notes[0]);
        } else {
            this.setSelectedNote(null);
        }
    }

    public async addNoteAsync(): Promise<void> {
        let baseTitle: string = await this.translateService.get('Notes.NewNote').toPromise();

        // Create a new note
        let result: NoteOperationResult = this.collectionService.addNote(baseTitle, this.selectedNotebook.id);

        if (result.operation === Operation.Success) {
            // Show the note window
            ipcRenderer.send('open-note-window', result.noteId);
        }
    }

    public async deleteNoteAsync(): Promise<void> {
        let title: string = await this.translateService.get('DialogTitles.ConfirmDeleteNote').toPromise();
        let text: string = await this.translateService.get('DialogTexts.ConfirmDeleteNote', { noteTitle: this.selectedNote.title }).toPromise();

        let dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {

            width: '450px', data: { dialogTitle: title, dialogText: text }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {

                if (!this.collectionService.noteIsOpen(this.selectedNote.id)) {
                    let operation: Operation = await this.collectionService.deleteNoteAsync(this.selectedNote.id);

                    if (operation === Operation.Error) {
                        let generatedErrorText: string = (await this.translateService.get('ErrorTexts.DeleteNoteError', { noteTitle: this.selectedNote.title }).toPromise());
                        this.dialog.open(ErrorDialogComponent, {
                            width: '450px', data: { errorText: generatedErrorText }
                        });
                    }
                } else {
                    this.snackBarService.noteDeleteBlockedAsync(this.selectedNote.title);
                }
            }
        });
    }

    public openNote(): void {
        if (!this.collectionService.noteIsOpen(this.selectedNote.id)) {
            ipcRenderer.send('open-note-window', this.selectedNote.id);
        } else {
            this.snackBarService.noteAlreadyOpenAsync();
        }
    }

    public toggleNoteMark(note: Note): void {
        this.collectionService.setNoteMark(note.id, !note.isMarked);
    }
}
