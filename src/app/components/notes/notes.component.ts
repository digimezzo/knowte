import { Component, OnInit, Input, NgZone, OnDestroy } from '@angular/core';
import log from 'electron-log';
import { CollectionService } from '../../services/collection.service';
import { Note } from '../../data/entities/note';
import { Subscription, Subject } from 'rxjs';
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

@Component({
    selector: 'notes-component',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit, OnDestroy {
    constructor(private dialog: MatDialog, private collectionService: CollectionService, private snackBarService: SnackBarService,
        private translateService: TranslateService, public searchService: SearchService, private zone: NgZone) {
    }

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
        this.getNotesAsync();
    }

    private subscription: Subscription;
    public notes: Note[] = [];
    public selectedNote: Note;
    public notesCount: number = 0;
    public canEditNote: boolean = false;

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    async ngOnInit() {
        // Workaround for auto reload
        await this.collectionService.initializeAsync();

        this.subscription = this.collectionService.noteAdded$.subscribe(async () => await this.getNotesAsync());
        this.subscription.add(this.collectionService.noteNotebookChanged$.subscribe(async () => this.zone.run(async () => await this.getNotesAsync())));
        this.subscription.add(this.searchService.searchTextChanged$.subscribe((_) => this.getNotesAsync()));

        this.subscription.add(this.collectionService.noteDeleted$.subscribe(async () => {
            this.setSelectedNote(null);
            await this.getNotesAsync();
        }));

        this.subscription.add(this.collectionService.noteMarkChanged$.subscribe(async (result) => {
            if (this.componentCategory === Constants.markedCategory) {
                await this.getNotesAsync();
            } else {
                if (this.notes.length > 0) {
                    let noteToMark: Note = this.notes.find(x => x.id === result.noteId);

                    if (noteToMark) {
                        noteToMark.isMarked = result.isMarked;
                    }
                }
            }
        }));

        this.subscription.add(this.categoryChangedSubject.subscribe(async (selectedCategory) => {
            this.selectedCategory = selectedCategory;
            await this.getNotesAsync();
        }));
    }

    private async getNotesAsync(): Promise<void> {

        // Only fetch notes list for selected category
        if (this.componentCategory !== this.selectedCategory) {
            return;
        }

        if (this.selectedNotebook) {
            this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id, this.componentCategory, true);
            this.notesCount = this.notes.length;
            this.selectFirstNote();
        }
    }

    public setSelectedNote(note: Note) {
        this.selectedNote = note;
        this.canEditNote = this.selectedNote != null;
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

    public toggleNoteMark(noteId: string): void {
        this.collectionService.toggleNoteMark(noteId);
    }
}
