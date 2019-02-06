import { Component, OnInit, ViewEncapsulation, OnDestroy, HostListener } from '@angular/core';
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
import { remote } from 'electron';
import { NoteRenamedArgs } from '../../services/noteRenamedArgs';

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
    private isDirty: boolean = false;

    public note: Note;
    private originalNoteTitle: string;

    // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event) {
        log.info(`Closing note with id=${this.note.id}`);

        if (this.isDirty) {
            event.preventDefault();
            event.returnValue = '';

            log.info(`Note with id=${this.note.id} is dirty. Preventing close.`);
            // let operation: NoteOperation = this.collectionService.updateNote(this.note);
            let operation: NoteOperation = this.collectionService.renameNote(this.note.id, this.note.title);
            //     if (operation === NoteOperation.Error) {
            //         let generatedErrorText: string = (await this.translateService.get('ErrorTexts.SaveNoteError', { noteTitle: this.originalNoteTitle }).toPromise());

            //         this.dialog.open(ErrorDialogComponent, {
            //             width: '450px', data: { errorText: generatedErrorText }
            //         });
            //     }else{
            //         this.noteService.noteRenamed.next(new NoteRenamedArgs(this.note.id, this.note.title));
            //     }

            if (operation === NoteOperation.Error) {
                this.note.title = this.originalNoteTitle;
                this.snackBarService.duplicateNote(this.note.title);
            } else if (operation === NoteOperation.Duplicate) {
                this.note.title = this.originalNoteTitle;
            } else {
                this.originalNoteTitle = this.note.title;
                this.noteService.noteRenamed.next(new NoteRenamedArgs(this.note.id, this.note.title));
            }

            this.isDirty = false;
        }

        this.noteService.noteRenamed.next(new NoteRenamedArgs(this.note.id, this.note.title));
        this.noteService.closeNote(this.note.id);
        log.info(`Closed note with id=${this.note.id}`);
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
            this.note = this.collectionService.getNote(noteId);
            log.info(`Opening note with id=${this.note.id}`);
            this.noteService.openNote(this.note.id);
            this.originalNoteTitle = this.note.title;
        });

        this.noteTitleChanged
            .pipe(debounceTime(5000), distinctUntilChanged())
            .subscribe(async (newNoteTitle) => {
                let operation: NoteOperation = this.collectionService.renameNote(this.note.id, newNoteTitle);

                if (operation === NoteOperation.Error) {
                    this.note.title = this.originalNoteTitle;
                    this.snackBarService.duplicateNote(newNoteTitle);
                } else if (operation === NoteOperation.Duplicate) {
                    this.note.title = this.originalNoteTitle;

                    let generatedErrorText: string = (await this.translateService.get('ErrorTexts.RenameNoteError', { noteTitle: this.originalNoteTitle }).toPromise());

                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px', data: { errorText: generatedErrorText }
                    });
                } else {
                    this.originalNoteTitle = this.note.title;
                    this.noteService.noteRenamed.next(new NoteRenamedArgs(this.note.id, this.note.title));
                }
            });
    }

    public onNotetitleChange(newNoteTitle: string) {
        this.isDirty = true;
        this.noteTitleChanged.next(newNoteTitle);
    }

    public performAction(): void {

    }
}
