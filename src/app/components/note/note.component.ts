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

    public noteId: string;
    public noteTitle: string;
    private originalNoteTitle: string;

     // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event) {
        log.info(`Opening note with id=${this.noteId}`);
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
            this.noteId = params['id'];
            log.info(`Opening note with id=${this.noteId}`);

            // Get the note from the data store
            let note: Note = this.collectionService.getNote(this.noteId);
            this.noteTitle = note.title;
            this.originalNoteTitle = note.title;
        });

        this.noteTitleChanged
            .pipe(debounceTime(5000), distinctUntilChanged())
            .subscribe(async (newNoteTitle) => {
                let operation: NoteOperation = this.collectionService.renameNote(this.noteId, newNoteTitle);

                if (operation === NoteOperation.Error) {
                    this.noteTitle = this.originalNoteTitle;
                    this.snackBarService.duplicateNote(newNoteTitle);
                } else if (operation === NoteOperation.Duplicate) {
                    this.noteTitle = this.originalNoteTitle;

                    let generatedErrorText: string = (await this.translateService.get('ErrorTexts.RenameNoteError', { noteTitle: this.originalNoteTitle }).toPromise());

                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px', data: { errorText: generatedErrorText }
                    });
                } else {
                    this.originalNoteTitle = this.noteTitle;
                    this.noteService.noteRenamed.next(new NoteRenamedArgs(this.noteId, this.noteTitle));
                }
            });
    }

    public onNotetitleChange(newNoteTitle: string) {
        this.noteTitleChanged.next(newNoteTitle);
    }

    public performAction(): void {

    }
}
