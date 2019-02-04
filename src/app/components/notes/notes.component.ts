import { Component, OnInit, Input, NgZone } from '@angular/core';
import log from 'electron-log';
import { CollectionService } from '../../services/collection.service';
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
import { remote } from 'electron';

@Component({
    selector: 'notes-component',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
    constructor(private dialog: MatDialog, private collectionService: CollectionService, private snackBarService: SnackBarService,
        private translateService: TranslateService, private zone: NgZone) {
    }

    private noteService = remote.getGlobal('noteService');
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
        // Get notes
        await this.getNotesAsync();

        this.subscription = this.collectionService.noteAdded$.subscribe(async (noteTitle) => {
            await this.getNotesAsync();
            this.snackBarService.noteAddedAsync(noteTitle);
        });

        this.subscription = this.collectionService.noteDeleted$.subscribe(async (noteTitle) => {
            this.setSelectedNote(null);
            await this.getNotesAsync();
            this.snackBarService.noteDeletedAsync(noteTitle);
        });

        this.subscription = this.collectionService.noteMarkChanged$.subscribe((noteMarkChangedArgument) => {
            this.notes.find(x => x.id === noteMarkChangedArgument.noteId).isMarked = noteMarkChangedArgument.isMarked;
        });

        this.subscription = this.noteService.noteRenamed$.subscribe((noteRenamedArgs) => {
            this.zone.run(async () => {
                await this.getNotesAsync();
            });

        });
    }

    private async getNotesAsync(): Promise<void> {
        if (this.selectedNotebook) {
            this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id, true);
            this.notesCount = this.notes.length;
            this.selectFirstNote();
        }
    }

    public setSelectedNote(note: Note) {
        this.selectedNote = note;
        this.canEditNote = this.selectedNote != null;
    }

    public selectFirstNote(){
        if(this.notes && this.notes.length > 0){
            this.setSelectedNote(this.notes[0]);
        }else{
            this.setSelectedNote(null);
        }
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

                if (!this.noteService.noteIsOpen(this.selectedNote.id)) {
                    let operation: NoteOperation = await this.collectionService.deleteNoteAsync(this.selectedNote.id);

                    if (operation === NoteOperation.Error) {
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
        if (!this.noteService.noteIsOpen(this.selectedNote.id)) {
            ipcRenderer.send('open-note-window', this.selectedNote.id);
        } else {
            this.snackBarService.noteAlreadyOpenAsync();
        }
    }

    public ToggleNoteMark(noteId: string, isMarked: boolean): void {
        this.collectionService.setNoteMark(noteId, !isMarked);
    }
}
