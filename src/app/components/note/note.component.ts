import { Component, OnInit, ViewEncapsulation, HostListener, OnDestroy, NgZone } from '@angular/core';
import log from 'electron-log';
import { CollectionService } from '../../services/collection.service';
import * as Quill from 'quill';
import { ActivatedRoute } from '@angular/router';
import { Note } from '../../data/entities/note';
import { Subject } from 'rxjs';
import { debounceTime } from "rxjs/internal/operators";
import { SnackBarService } from '../../services/snackBar.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorDialogComponent } from '../dialogs/errorDialog/errorDialog.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { remote, BrowserWindow } from 'electron';
import { Operation } from '../../core/enums';
import { NoteOperationResult } from '../../services/results/noteOperationResult';
import { NoteService } from '../../services/note.service';
import { Notebook } from '../../data/entities/notebook';
import { ChangeNotebookDialogComponent } from '../dialogs/changeNotebookDialog/changeNotebookDialog.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'note-content',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteComponent implements OnInit, OnDestroy {
    constructor(private collectionService: CollectionService, private activatedRoute: ActivatedRoute,
        private snackBarService: SnackBarService, private translateService: TranslateService, private noteService: NoteService,
        private dialog: MatDialog, private zone: NgZone) {
    }

    private subscription: Subscription;

    public noteTitleChanged: Subject<string> = new Subject<string>();
    public noteTextChanged: Subject<string> = new Subject<string>();
    public saveChangedAndCloseNoteWindow: Subject<string> = new Subject<string>();
    private isTitleChanged: boolean = false;
    private isContentChanged: boolean = false;

    private noteId: string;
    private originalNoteTitle: string;
    public noteTitle: string;
    public isMarked: boolean;
    private saveTimeoutMilliseconds: number = 5000;
    private windowCloseTimeoutMilliseconds: number = 500;

    private quill: Quill;

    // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event) {
        log.info(`Detected closing of note with id=${this.noteId}`);

        // Prevents closing of the window
        if (this.isTitleChanged || this.isContentChanged) {
            this.isTitleChanged = false;
            this.isContentChanged = false;

            log.info(`Note with id=${this.noteId} is dirty. Preventing close to save changes first.`);
            event.preventDefault();
            event.returnValue = '';

            this.saveChangedAndCloseNoteWindow.next("");
        } else {
            log.info(`Note with id=${this.noteId} is clean. Closing directly.`);
            this.collectionService.setNoteIsOpen(this.noteId, false);
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    async ngOnInit() {
        await this.collectionService.initializeDataStoreAsync();

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
            this.isContentChanged = true;
            this.noteTextChanged.next("");
        });

        // Get note id from url
        this.activatedRoute.queryParams.subscribe(async (params) => {
            let noteId: string = params['id'];

            // Get the note from the data store
            let note: Note = this.collectionService.getNote(noteId);
            log.info(`Opening note with id=${note.id}`);
            this.collectionService.setNoteIsOpen(note.id, true);

            this.noteId = note.id;
            this.originalNoteTitle = note.title;
            this.noteTitle = note.title;
            this.isMarked = note.isMarked;

            await this.getNoteContentAsync();
        });

        this.noteTitleChanged
            .pipe(debounceTime(this.saveTimeoutMilliseconds))
            .subscribe(async (newNoteTitle) => {
                await this.saveNoteTitleAsync(newNoteTitle);
            });

        this.noteTextChanged
            .pipe(debounceTime(this.saveTimeoutMilliseconds))
            .subscribe(async (_) => {
                await this.saveNoteContentAsync();
            });

        this.saveChangedAndCloseNoteWindow
            .pipe(debounceTime(this.windowCloseTimeoutMilliseconds))
            .subscribe((_) => {
                log.info(`Closing note with id=${this.noteId} after saving changes.`);
                this.collectionService.setNoteIsOpen(this.noteId, false);
                this.saveNoteAll();

                let window: BrowserWindow = remote.getCurrentWindow();
                window.close();
            });

        this.subscription = this.noteService.notebookChangeRequested$.subscribe((noteId) => this.changeNotebook(noteId));

        this.subscription.add(this.noteService.noteMarkChanged$.subscribe(async (result) => {
            if (this.noteId === result.noteId) {
                this.zone.run(async () => {
                    this.isMarked = result.isMarked;
                });
            }
        }));

        // this.quill.clipboard.dangerouslyPasteHTML(0, `<HTML><BODY><P STYLE="text-align:Left;font-family:Calibri;font-size:15;">Om uw kinderen in te plannen voor de vakantieopvang dient u zich aan te melden via onderstaande planningslink met onderstaande <SPAN STYLE="font-weight:bold;">gebruikersnaam </SPAN>en <SPAN STYLE="font-weight:bold;">wachtwoord</SPAN>.</P><P STYLE="text-align:Left;font-family:Calibri;font-size:15;" /><UL STYLE="text-align:Left;font-family:Calibri;font-size:15;"><LI><P>Uw gebruiker:  15704293</P></LI><LI><P>Uw wachtwoord: upv7s88</P></LI></UL><P STYLE="text-align:Left;font-family:Calibri;font-size:15;" /><P STYLE="text-align:Left;font-family:Calibri;font-size:15;">Om <SPAN STYLE="background-color:#FFFF00;">vakantiedagen </SPAN>aan te vragen, klik op de link  </P><P STYLE="text-align:Left;font-family:Calibri;font-size:15;">Werkt deze link niet? </P><P STYLE="text-align:Left;font-family:Calibri;font-size:15;">surf naar  ,  klik op 'reserveren', klik bij stap 2 Plannen op 'Hier'. </P><P STYLE="text-align:Left;font-family:Calibri;font-size:15;" /><P STYLE="text-align:Left;font-family:Calibri;font-size:15;">Bij de eerste maal aanloggen dient u dit wachtwoord direct te wijzigen. Houd uw gebruikersnaam en nieuwe wachtwoord zorgvuldig bij. U heeft het later nog nodig indien u wijzigingen in de opvangkalender wilt aanbrengen</P><P STYLE="text-align:Left;font-family:Calibri;font-size:15;" /><P STYLE="text-align:Left;font-family:Calibri;font-size:15;">Met vriendelijke groet,</P><P STYLE="text-align:Left;font-family:Calibri;font-size:15;">Stekelbees - Vakantieopvang voor Bedrijven vakantie@landelijkekinderopvang.be</P><P STYLE="text-align:Left;font-family:Calibri;font-size:15;">016/24 20 77</P><P STYLE="text-align:Left;font-family:Calibri;font-size:15;" /></BODY></HTML>`);
    }

    public onNotetitleChange(newNoteTitle: string) {
        this.isTitleChanged = true;
        this.noteTitleChanged.next(newNoteTitle);
    }

    public performAction(): void {

    }

    private async saveNoteTitleAsync(newNoteTitle: string): Promise<void> {
        let result: NoteOperationResult = this.noteService.renameNote(this.noteId, this.originalNoteTitle, newNoteTitle);

        if (result.operation === Operation.Blank) {
            this.noteTitle = this.originalNoteTitle;
            this.snackBarService.noteTitleCannotBeEmptyAsync();
        } else if (result.operation === Operation.Error) {
            this.noteTitle = this.originalNoteTitle;
            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.RenameNoteError', { noteTitle: this.originalNoteTitle }).toPromise());

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: generatedErrorText }
            });
        } else if (result.operation === Operation.Success) {
            this.originalNoteTitle = result.noteTitle;
            this.noteTitle = result.noteTitle;
        } else {
            // Do nothing
        }
    }

    private async saveNoteContentAsync(): Promise<void> {
        // let html: string = this.quill.container.firstChild.innerHTML;
        let textContent: string = this.quill.getText();
        let jsonContent: string = JSON.stringify(this.quill.getContents());

        let operation: Operation = this.collectionService.updateNoteContent(this.noteId, textContent, jsonContent);

        if (operation === Operation.Error) {
            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.UpdateNoteContentError').toPromise());

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: generatedErrorText }
            });
        } else {
            // Do nothing
        }
    }

    private saveNoteAll(): void {
        let textContent: string = this.quill.getText();
        let jsonContent: string = JSON.stringify(this.quill.getContents());
        this.noteService.updateNote(this.noteId, this.noteTitle, textContent, jsonContent);
    }

    private async getNoteContentAsync(): Promise<void> {
        let result: NoteOperationResult = this.collectionService.getNoteContent(this.noteId);

        if (result.operation === Operation.Error) {
            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.GetNoteContentError').toPromise());

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: generatedErrorText }
            });
        } else {
            if (result.noteContent) {
                // We can only parse to json if there is content
                this.quill.setContents(JSON.parse(result.noteContent), 'silent');
            }
        }
    }

    private changeNotebook(noteId: string) {
        // Because all open notes get this request, we need to match the noteId.
        if (noteId === this.noteId) {
            let dialogRef: MatDialogRef<ChangeNotebookDialogComponent> = this.dialog.open(ChangeNotebookDialogComponent, {
                width: '450px', data: { noteId: noteId }
            });
        }
    }

    public toggleNoteMark(): void {
        this.noteService.setNoteMark(this.noteId, !this.isMarked);
    }
}
