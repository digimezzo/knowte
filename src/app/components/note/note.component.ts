import { Component, OnInit, ViewEncapsulation, OnDestroy, HostListener, NgZone } from '@angular/core';
import { remote } from 'electron';
import { ActivatedRoute } from '@angular/router';
import { NoteDetailsResult } from '../../services/results/noteDetailsResult';
import log from 'electron-log';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ChangeNotebookDialogComponent } from '../dialogs/changeNotebookDialog/changeNotebookDialog.component';
import { Constants } from '../../core/constants';
import { Subject } from 'rxjs';
import { debounceTime } from "rxjs/internal/operators";
import { Operation } from '../../core/enums';
import { NoteOperationResult } from '../../services/results/noteOperationResult';
import { SnackBarService } from '../../services/snackBar.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';
import * as Quill from 'quill';

@Component({
    selector: 'note-content',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteComponent implements OnInit, OnDestroy {
    constructor(private activatedRoute: ActivatedRoute, private zone: NgZone, private dialog: MatDialog,
        private snackBarService: SnackBarService, private translateService: TranslateService) {
    }

    private saveTimeoutMilliseconds: number = 5000;

    private quill: Quill;

    private globalEmitter = remote.getGlobal('globalEmitter');
    private noteId: string;
    public initialNoteTitle: string;
    public noteTitle: string;
    public notebookName: string;
    public isMarked: boolean;

    public noteTitleChanged: Subject<string> = new Subject<string>();
    public noteTextChanged: Subject<string> = new Subject<string>();

    private noteMarkChangedListener: any = this.noteMarkChangedHandler.bind(this);
    private notebookChangedListener: any = this.notebookChangedHandler.bind(this);

    // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event) {
        this.globalEmitter.emit(Constants.setNoteOpenEvent, this.noteId, false);
        this.globalEmitter.removeListener(`${Constants.noteMarkChangedEvent}-${this.noteId}`, this.noteMarkChangedListener);
        this.globalEmitter.removeListener(`${Constants.notebookChangedEvent}`, this.notebookChangedListener);
    }

    ngOnDestroy() {
    }

    async ngOnInit() {
        let notePlaceHolder: string = await this.translateService.get('Notes.NotePlaceholder').toPromise();

        let toolbarOptions: any = [
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            // [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
            // [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
            // [{ 'direction': 'rtl' }],                         // text direction
            // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            // [{ 'font': [] }],
            // [{ 'align': [] }],
            ['clean']                                         // remove formatting button
        ];

        this.quill = new Quill('#editor', {
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: notePlaceHolder,
            theme: 'snow',
        });

        this.quill.on('text-change', () => {
            this.noteTextChanged.next("");
        });

        this.activatedRoute.queryParams.subscribe(async (params) => {
            this.noteId = params['id'];
            this.globalEmitter.on(Constants.noteMarkChangedEvent, this.noteMarkChangedListener);
            this.globalEmitter.on(Constants.notebookChangedEvent, this.notebookChangedListener);
            this.globalEmitter.emit(Constants.setNoteOpenEvent, this.noteId, true);
            this.globalEmitter.emit(Constants.getNoteDetailsEvent, this.noteId, this.getNoteDetailsCallback.bind(this));
        });

        this.noteTitleChanged
            .pipe(debounceTime(this.saveTimeoutMilliseconds))
            .subscribe((finalNoteTitle) => {
                this.globalEmitter.emit(Constants.setNoteTitleEvent, this.noteId, this.initialNoteTitle, finalNoteTitle, this.setNoteTitleCallback.bind(this));
            });

        this.noteTextChanged
            .pipe(debounceTime(this.saveTimeoutMilliseconds))
            .subscribe(async (_) => {
                // await this.saveNoteContentAsync();
            });
    }

    private getNoteDetailsCallback(result: NoteDetailsResult) {
        this.zone.run(() => {
            this.initialNoteTitle = result.noteTitle;
            this.noteTitle = result.noteTitle;
            this.notebookName = result.notebookName;
            this.isMarked = result.isMarked;
        });
    }

    private noteMarkChangedHandler(noteId: string, isMarked: boolean) {
        if (this.noteId === noteId) {
            this.zone.run(() => this.isMarked = isMarked);
        }
    }

    private notebookChangedHandler(noteId: string, notebookName: string) {
        if (this.noteId === noteId) {
            this.zone.run(() => this.notebookName = notebookName);
        }
    }

    private handleNoteMarkToggled(isNoteMarked: boolean) {
        this.zone.run(() => this.isMarked = isNoteMarked);
    }

    public changeNotebook(): void {
        let dialogRef: MatDialogRef<ChangeNotebookDialogComponent> = this.dialog.open(ChangeNotebookDialogComponent, {
            width: '450px', data: { noteId: this.noteId }
        });
    }

    public toggleNoteMark(): void {
        this.globalEmitter.emit(Constants.setNoteMarkEvent, this.noteId, !this.isMarked);
    }

    public onNotetitleChange(newNoteTitle: string) {
        this.noteTitleChanged.next(newNoteTitle);
    }

    private async setNoteTitleCallback(result: NoteOperationResult): Promise<void> {
        if (result.operation === Operation.Blank) {
            this.noteTitle = this.initialNoteTitle;
            this.snackBarService.noteTitleCannotBeEmptyAsync();
        } else if (result.operation === Operation.Error) {
            this.noteTitle = this.initialNoteTitle;
            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.RenameNoteError', { noteTitle: this.initialNoteTitle }).toPromise());

            this.zone.run(() => {
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px', data: { errorText: generatedErrorText }
                });
            });
        } else if (result.operation === Operation.Success) {
            this.initialNoteTitle = result.noteTitle;
            this.noteTitle = result.noteTitle;
        } else {
            // Do nothing
        }
    }
}
