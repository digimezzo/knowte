import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import log from 'electron-log';
import { CollectionService } from '../../services/collection.service';
import { ActivatedRoute } from '@angular/router';
import { Note } from '../../data/note';
import { Subscription } from 'rxjs';
import { SnackBarService } from '../../services/snackBar.service';
import { ipcRenderer } from 'electron';
import { Notebook } from '../../data/notebook';
import { AddNoteResult } from '../../services/addNoteResult';
import { NoteOperation } from '../../services/noteOperation';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../dialogs/confirmationDialog/confirmationDialog.component';
import { MatDialogRef, MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';

@Component({
    selector: 'notes-component',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
    constructor(private dialog: MatDialog, private collectionService: CollectionService, private snackBarService: SnackBarService, private translateService: TranslateService) {
    }

    private _selectedNotebook: Notebook;

    get selectedNotebook(): Notebook {
        return this._selectedNotebook;
    }

    @Input()
    set selectedNotebook(val: Notebook) {
        this._selectedNotebook = val;
        this.getNotesAsync();
    }

    private subscription: Subscription;
    public notes: Note[];
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

        this.subscription = this.collectionService.noteAdded$.subscribe(async (noteTitle) => {
            await this.getNotesAsync();
            this.snackBarService.noteAddedAsync(noteTitle);
        });

        this.subscription = this.collectionService.noteDeleted$.subscribe(async (noteTitle) => {
            await this.getNotesAsync();
            this.snackBarService.noteDeletedAsync(noteTitle);
        });

        this.subscription = this.collectionService.noteMarkChanged$.subscribe((noteMarkChangedArgument) => {
            this.notes.find(x => x.id === noteMarkChangedArgument.noteId).isMarked = noteMarkChangedArgument.isMarked;
        });
    }

    private async getNotesAsync(): Promise<void> {
        if (this.selectedNotebook) {
            this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id, true);
            this.notesCount = this.notes.length;
        }
    }

    public setSelectedNote(note: Note) {
        this.selectedNote = note;
        this.canEditNote = this.selectedNote != null;
    }

    public async addNoteAsync(): Promise<void> {
        let baseTitle: string = await this.translateService.get('Notes.NewNote').toPromise();

        // Create a new note
        let addNoteResult: AddNoteResult = this.collectionService.addNote(baseTitle, this.selectedNotebook.id);

        if (addNoteResult.operation === NoteOperation.Success) {
            // Show the note window
            ipcRenderer.send('open-note-window', addNoteResult.noteId);
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
                let operation: NoteOperation = await this.collectionService.deleteNoteAsync(this.selectedNote.id);

                if (operation === NoteOperation.Blocked) {
                    this.snackBarService.noteDeleteBlockedAsync(this.selectedNote.title);
                } else if (operation === NoteOperation.Error) {
                    let generatedErrorText: string = (await this.translateService.get('ErrorTexts.DeleteNoteError', { noteTitle: this.selectedNote.title }).toPromise());
                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px', data: { errorText: generatedErrorText }
                    });
                }
            }
        });
    }

    public openNote(): void {
        if (this.collectionService.canOpenNote(this.selectedNote.id)) {
            ipcRenderer.send('open-note-window', this.selectedNote.id);
        } else {
            this.snackBarService.noteAlreadyOpenAsync();
        }
    }

    public ToggleNoteMark(noteId: string, isMarked: boolean): void {
        this.collectionService.setNoteMark(noteId, !isMarked);
    }
}
