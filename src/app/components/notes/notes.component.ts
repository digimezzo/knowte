import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import log from 'electron-log';
import { CollectionService } from '../../services/collection.service';
import { ActivatedRoute } from '@angular/router';
import { Note } from '../../data/note';
import { Subscription } from 'rxjs';
import { SnackBarService } from '../../services/snackBar.service';
import { ipcRenderer } from 'electron';
import { Notebook } from '../../data/notebook';

@Component({
    selector: 'notes-component',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
    constructor(private collectionService: CollectionService, private snackBarService: SnackBarService) {
    }

    private _selectedNotebook: Notebook;

    get selectedNotebook(): Notebook {
        return this._selectedNotebook;
    }

    @Input()
    set selectedNotebook(val: Notebook){
        this._selectedNotebook = val;
        this.getNotesAsync();
    }

    private subscription: Subscription;
    public notes: Note[];
    public selectedNote: Note;
    public notesCount: number = 0;

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    async ngOnInit() {
        // Notes
        await this.getNotesAsync();

        this.subscription = this.collectionService.noteAdded$.subscribe(async (noteTitle) => {
            await this.getNotesAsync();
            this.snackBarService.noteAdded(noteTitle);
        });
    }

    private async getNotesAsync(): Promise<void> {
        if (this.selectedNotebook) {
            this.notes = await this.collectionService.getNotesAsync(this.selectedNotebook.id);
        }
    }

    public setSelectedNote(note: Note) {
        this.selectedNote = note;
    }

    public openNote(): void {
        ipcRenderer.send('open-note-window', this.selectedNote.id);
    }
}
