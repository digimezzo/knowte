import { Component, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import log from 'electron-log';
import { CollectionService } from '../../services/collection.service';
import * as Quill from 'quill';
import { ActivatedRoute } from '@angular/router';
import { Note } from '../../data/note';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from "rxjs/internal/operators";
import { NoteOperation } from '../../services/noteOperation';
import { SnackBarService } from '../../services/snackBar.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';
import { MatDialog } from '@angular/material';
import { remote, BrowserWindow } from 'electron';
import { RenameNoteResult } from '../../services/renameNoteResult';

@Component({
    selector: 'note-content',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteComponent implements OnInit {
    constructor(private collectionService: CollectionService, private activatedRoute: ActivatedRoute,
        private snackBarService: SnackBarService, private translateService: TranslateService,
        private dialog: MatDialog) {
    }

    private noteService = remote.getGlobal('noteService');
    public noteTitleChanged: Subject<string> = new Subject<string>();
    public saveChangedAndCloseNoteWindow: Subject<string> = new Subject<string>();
    private isDirty: boolean = false;

    private noteId: string;
    private originalNoteTitle: string;
    private noteTitle: string;

    // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event) {
        log.info(`Detected closing of note with id=${this.noteId}`);

        // Prevents closing of the window
        if (this.isDirty) {
            this.isDirty = false;

            log.info(`Note with id=${this.noteId} is dirty. Preventing close to save changes first.`);
            event.preventDefault();
            event.returnValue = '';

            this.saveChangedAndCloseNoteWindow.next("");
        } else {
            log.info(`Note with id=${this.noteId} is clean. Closing directly.`);
            this.noteService.closeNote(this.noteId);
        }
    }

    async ngOnInit() {
        this.collectionService.initializeDataStoreAsync();

        let notePlaceHolder: string = await this.translateService.get('Notes.NotePlaceholder').toPromise();

        var quill = new Quill('#editor', {
            placeholder: notePlaceHolder,
            theme: 'snow',
        });

        // Get note id from url
        this.activatedRoute.queryParams.subscribe(params => {
            let noteId: string = params['id'];

            // Get the note from the data store
            let note: Note = this.collectionService.getNote(noteId);
            log.info(`Opening note with id=${note.id}`);
            this.noteService.openNote(note.id);

            this.noteId = note.id;
            this.originalNoteTitle = note.title;
            this.noteTitle = note.title;
        });

        this.noteTitleChanged
            .pipe(debounceTime(5000), distinctUntilChanged())
            .subscribe(async (newNoteTitle) => {
                let renameNoteResult: RenameNoteResult = this.noteService.renameNote(this.noteId, this.originalNoteTitle, newNoteTitle);

                if (renameNoteResult.operation === NoteOperation.Blank) {
                    this.noteTitle = this.originalNoteTitle;
                    this.snackBarService.noteTitleCannotBeEmptyAsync();
                } else if (renameNoteResult.operation === NoteOperation.Error) {
                    this.noteTitle = this.originalNoteTitle;
                    let generatedErrorText: string = (await this.translateService.get('ErrorTexts.RenameNoteError', { noteTitle: this.originalNoteTitle }).toPromise());

                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px', data: { errorText: generatedErrorText }
                    });
                } else if (renameNoteResult.operation === NoteOperation.Success) {
                    this.originalNoteTitle = renameNoteResult.newNoteTitle;
                    this.noteTitle = renameNoteResult.newNoteTitle;
                    this.noteService.noteRenamed.next("");
                } else {
                    // Do nothing
                }
            });

        this.saveChangedAndCloseNoteWindow
            .pipe(debounceTime(500), distinctUntilChanged())
            .subscribe((dummyString) => {
                log.info(`Closing note with id=${this.noteId} after saving changes.`);
                this.noteService.closeNote(this.noteId);

                // TODO: save stuff here

                let window: BrowserWindow = remote.getCurrentWindow();
                window.close();
            });
    }

    public onNotetitleChange(newNoteTitle: string) {
        this.isDirty = true;
        this.noteTitleChanged.next(newNoteTitle);
    }

    public performAction(): void {

    }
}
