import { Component, OnInit, ViewEncapsulation, OnDestroy, HostListener, NgZone } from '@angular/core';
import { remote, BrowserWindow } from 'electron';
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
import * as path from 'path';
import * as fs from 'fs-extra';
import * as Store from 'electron-store';
import { Utils } from '../../core/utils';

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

    private settings: Store = new Store();
    private saveTimeoutMilliseconds: number = 5000;
    private windowCloseTimeoutMilliseconds: number = 500;

    private quill: Quill;

    private globalEmitter = remote.getGlobal('globalEmitter');
    private noteId: string;
    public initialNoteTitle: string;
    public noteTitle: string;
    public notebookName: string;
    public isMarked: boolean;

    private isTitleDirty: boolean = false;
    private isTextDirty: boolean = false;

    public noteTitleChanged: Subject<string> = new Subject<string>();
    public noteTextChanged: Subject<string> = new Subject<string>();
    public saveChangesAndCloseNoteWindow: Subject<string> = new Subject<string>();

    private noteMarkChangedListener: any = this.noteMarkChangedHandler.bind(this);
    private notebookChangedListener: any = this.notebookChangedHandler.bind(this);

    // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event) {
        log.info(`Detected closing of note with id=${this.noteId}`);

        // Prevents closing of the window
        if (this.isTitleDirty || this.isTextDirty) {
            this.isTitleDirty = false;
            this.isTextDirty = false;

            log.info(`Note with id=${this.noteId} is dirty. Preventing close to save changes first.`);
            event.preventDefault();
            event.returnValue = '';

            this.saveChangesAndCloseNoteWindow.next("");
        } else {
            log.info(`Note with id=${this.noteId} is clean. Closing directly.`);
            this.cleanup();
        }
    }

    private cleanup(): void {
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
            ['blockquote', 'code-block', 'image'],
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
            this.isTextDirty = true;
            this.noteTextChanged.next("");
        });

        this.activatedRoute.queryParams.subscribe(async (params) => {
            this.noteId = params['id'];
            this.globalEmitter.on(Constants.noteMarkChangedEvent, this.noteMarkChangedListener);
            this.globalEmitter.on(Constants.notebookChangedEvent, this.notebookChangedListener);
            this.globalEmitter.emit(Constants.setNoteOpenEvent, this.noteId, true);
            this.globalEmitter.emit(Constants.getNoteDetailsEvent, this.noteId, this.getNoteDetailsCallback.bind(this));

            this.getNoteContentAsync();
        });

        this.noteTitleChanged
            .pipe(debounceTime(this.saveTimeoutMilliseconds))
            .subscribe((finalNoteTitle) => {
                this.globalEmitter.emit(Constants.setNoteTitleEvent, this.noteId, this.initialNoteTitle, finalNoteTitle, this.setNoteTitleCallbackAsync.bind(this));
            });

        this.noteTextChanged
            .pipe(debounceTime(this.saveTimeoutMilliseconds))
            .subscribe(async (_) => {
                this.globalEmitter.emit(Constants.setNoteTextEvent, this.noteId, this.quill.getText(), this.setNoteTextCallbackAsync.bind(this));
                log.info(this.quill.root.innerHTML);
            });

        this.saveChangesAndCloseNoteWindow
            .pipe(debounceTime(this.windowCloseTimeoutMilliseconds))
            .subscribe((_) => {
                this.saveAndClose();
            });
    }

    private saveAndClose(): void {
        this.globalEmitter.emit(Constants.setNoteTitleEvent, this.noteId, this.initialNoteTitle, this.noteTitle, async (result: NoteOperationResult) => {
            let setTitleOperation: Operation = result.operation;
            await this.setNoteTitleCallbackAsync(result);

            this.globalEmitter.emit(Constants.setNoteTextEvent, this.noteId, this.quill.getText(), async (operation: Operation) => {
                let setTextOperation: Operation = operation;
                await this.setNoteTextCallbackAsync(operation);

                // Close is only allowed when saving both title and text is successful
                if (setTitleOperation === Operation.Success && setTextOperation === Operation.Success) {
                    log.info(`Closing note with id=${this.noteId} after saving changes.`);
                    this.cleanup();
                    let window: BrowserWindow = remote.getCurrentWindow();
                    window.close();
                }
            });
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
        this.isTitleDirty = true;
        this.noteTitleChanged.next(newNoteTitle);
    }

    private async setNoteTitleCallbackAsync(result: NoteOperationResult): Promise<void> {
        if (result.operation === Operation.Blank) {
            this.zone.run(() => this.noteTitle = this.initialNoteTitle);
            this.snackBarService.noteTitleCannotBeEmptyAsync();
        } else if (result.operation === Operation.Error) {
            this.zone.run(() => this.noteTitle = this.initialNoteTitle);
            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.RenameNoteError', { noteTitle: this.initialNoteTitle }).toPromise());

            this.zone.run(() => {
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px', data: { errorText: generatedErrorText }
                });
            });
        } else if (result.operation === Operation.Success) {
            this.zone.run(() => {
                this.initialNoteTitle = result.noteTitle;
                this.noteTitle = result.noteTitle;
            });
        } else {
            // Do nothing
        }

        this.isTitleDirty = false;
    }

    private writeTextToNoteFile(): void {
        // Update the note file on disk
        let activeCollection: string = this.settings.get('activeCollection');
        let jsonContent: string = JSON.stringify(this.quill.getContents());
        fs.writeFileSync(path.join(Utils.collectionToPath(activeCollection), `${this.noteId}${Constants.noteExtension}`), jsonContent);
    }

    private async setNoteTextCallbackAsync(operation: Operation): Promise<void> {
        let showErrorDialog: boolean = false;

        if (operation === Operation.Success) {
            try {
                this.writeTextToNoteFile();
            } catch (error) {
                log.error(`Could not set text for the note with id='${this.noteId}' in the note file. Cause: ${error}`);
                showErrorDialog = true;
            }
        } else if (operation === Operation.Error) {
            showErrorDialog = true;
        } else {
            // Do nothing
        }

        if (showErrorDialog) {
            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.UpdateNoteContentError').toPromise());

            this.zone.run(() => {
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px', data: { errorText: generatedErrorText }
                });
            });
        }

        this.isTextDirty = false;
    }

    public async getNoteContentAsync() {
        try {
            let activeCollection: string = this.settings.get('activeCollection');
            let noteContent: string = fs.readFileSync(path.join(Utils.collectionToPath(activeCollection), `${this.noteId}${Constants.noteExtension}`), 'utf8');

            if (noteContent) {
                // We can only parse to json if there is content
                this.quill.setContents(JSON.parse(noteContent), 'silent');
            }
        } catch (error) {
            log.error(`Could not get the content for the note with id='${this.noteId}'. Cause: ${error}`);

            let generatedErrorText: string = (await this.translateService.get('ErrorTexts.GetNoteContentError').toPromise());

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: generatedErrorText }
            });
        }
    }
}
