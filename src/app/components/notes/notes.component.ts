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
import { NoteService } from '../../services/note.service';

@Component({
    selector: 'notes-component',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit, OnDestroy {
    constructor(private dialog: MatDialog, private collectionService: CollectionService, private snackBarService: SnackBarService,
        private translateService: TranslateService, private noteService: NoteService, private zone: NgZone) {
    }

    private _selectedNotebook: Notebook;

    @Input()
    public categoryChangedSubject: Subject<any>;

    @Input()
    public category: string;

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
        // In case we crashed on a previous run, make sure all notes are closed.
        this.collectionService.closeAllNotes();

        // Get notes
        await this.getNotesAsync();

        this.subscription = this.collectionService.noteAdded$.subscribe(async () => {
            await this.getNotesAsync();
        });

        this.subscription.add(this.collectionService.noteDeleted$.subscribe(async () => {
            this.setSelectedNote(null);
            await this.getNotesAsync();
        }));

        this.subscription.add(this.collectionService.noteMarkChanged$.subscribe(async (result) => {
            if (this.category === Constants.markedCategory) {
                await this.getNotesAsync();
            } else {
                if (this.notes.length > 0) {
                    let noteToMark: Note = this.notes.find(x => x.id === result.noteId);

                    if(noteToMark){
                        noteToMark.isMarked = result.isMarked;
                    }
                }
            }
        }));

        this.subscription.add(this.noteService.noteRenamed$.subscribe(() => {
            this.zone.run(async () => {
                await this.getNotesAsync();
            });
        }));

        this.subscription.add(this.noteService.noteUpdated$.subscribe(() => {
            this.zone.run(async () => {
                await this.getNotesAsync();
            });
        }));

        this.subscription.add(this.noteService.notebookChanged$.subscribe(() => {
            this.zone.run(async () => {
                await this.getNotesAsync();
            });
        }));

        this.subscription.add(this.categoryChangedSubject.subscribe(async (event) => {
            await this.getNotesAsync();
        }));
    }

    private async getNotesAsync(): Promise<void> {
        if (this.selectedNotebook) {
            this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id, this.category, true);
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

                if (!this.collectionService.getNoteIsOpen(this.selectedNote.id)) {
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
        if (!this.collectionService.getNoteIsOpen(this.selectedNote.id)) {
            ipcRenderer.send('open-note-window', this.selectedNote.id);
        } else {
            this.snackBarService.noteAlreadyOpenAsync();
        }
    }

    public ToggleNoteMark(noteId: string, isMarked: boolean): void {
        this.collectionService.setNoteMark(noteId, !isMarked);
    }
}
