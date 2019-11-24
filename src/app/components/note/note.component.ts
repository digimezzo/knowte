import { Component, OnInit, OnDestroy, HostListener, NgZone, ViewEncapsulation } from '@angular/core';
import { remote, BrowserWindow, SaveDialogOptions, NativeImage } from 'electron';
import { ActivatedRoute } from '@angular/router';
import { NoteDetailsResult } from '../../services/results/noteDetailsResult';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ChangeNotebookDialogComponent } from '../dialogs/change-notebook-dialog/change-notebook-dialog.component';
import { Constants } from '../../core/constants';
import { Subject } from 'rxjs';
import { debounceTime } from "rxjs/internal/operators";
import { Operation } from '../../core/enums';
import { NoteOperationResult } from '../../services/results/noteOperationResult';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
import * as Quill from 'quill';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Utils } from '../../core/utils';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { NoteExport } from '../../core/note-export';
import { ipcRenderer } from 'electron';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TasksCount } from '../../core/tasks-count';
import { Logger } from '../../core/logger';
import { TranslatorService } from '../../services/translator/translator.service';
import { SettingsService } from '../../services/settings/settings.service';
import { ClipboardManager } from '../../core/clipboard-manager';

@Component({
    selector: 'app-note',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('actionIconRotation', [
            state('default', style({ transform: 'rotate(0)' })),
            state('rotated', style({ transform: 'rotate(90deg)' })),
            transition('rotated => default', animate('250ms ease-out')),
            transition('default => rotated', animate('250ms ease-in'))
        ])
    ],
})
export class NoteComponent implements OnInit, OnDestroy {
    private saveTimeoutMilliseconds: number = 5000;
    private windowCloseTimeoutMilliseconds: number = 500;
    private quill: Quill;
    private globalEmitter = remote.getGlobal('globalEmitter');
    private noteId: string;
    private isTitleDirty: boolean = false;
    private isTextDirty: boolean = false;
    private noteMarkChangedListener: any = this.noteMarkChangedHandler.bind(this);
    private notebookChangedListener: any = this.notebookChangedHandler.bind(this);
    private focusNoteListener: any = this.focusNoteHandler.bind(this);
    private closeNoteListener: any = this.closeNoteHandler.bind(this);
    private languageChangedListener: any = this.languageChangedHandler.bind(this);
    private fontSizeChangedListener: any = this.fontSizeChangedHandler.bind(this);

    private contextMenu: any;
    private cutContextMenuItem: any;
    private copyContextMenuItem: any;
    private pasteContextMenuItem: any;
    private deleteContextMenuItem: any;

    constructor(private activatedRoute: ActivatedRoute, private zone: NgZone, private dialog: MatDialog, private logger: Logger,
        private snackBar: SnackBarService, private translator: TranslatorService, private settings: SettingsService, private clipboard: ClipboardManager) {
    }

    public initialNoteTitle: string;
    public noteTitle: string;
    public notebookName: string;
    public isMarked: boolean;
    public noteTitleChanged: Subject<string> = new Subject<string>();
    public noteTextChanged: Subject<string> = new Subject<string>();
    public saveChangesAndCloseNoteWindow: Subject<string> = new Subject<string>();
    public canPerformActions: boolean = false;
    public isBusy: boolean = false;
    public actionIconRotation: string = 'default';

    public ngOnDestroy(): void {
    }

    public async ngOnInit(): Promise<void> {
        this.setEditorFontSize();
        this.addContextMenuAsync();

        let notePlaceHolder: string = await this.translator.getAsync('Notes.NotePlaceholder');

        let toolbarOptions: any = [
            [{ 'color': [] }, { 'background': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
            ['link', 'blockquote', 'code-block', 'image'],
            // [{ 'script': 'sub' }, { 'script': 'super' }], 
            // [{ 'indent': '-1' }, { 'indent': '+1' }],   
            // [{ 'direction': 'rtl' }],                      
            // [{ 'size': ['small', false, 'large', 'huge'] }], 
            // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            // [{ 'font': [] }],
            // [{ 'align': [] }],
            ['clean']
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
            this.clearSearch();
            this.noteTextChanged.next("");

        });

        // Forces paste of unformatted text (See: https://stackoverflow.com/questions/41237486/how-to-paste-plain-text-in-a-quill-based-editor)
        this.quill.clipboard.addMatcher(Node.ELEMENT_NODE, function (node, delta) {
            var plaintext = node.innerText;
            var Delta = Quill.import('delta');
            return new Delta().insert(plaintext);
        });

        this.activatedRoute.queryParams.subscribe(async (params) => {
            this.noteId = params['id'];

            this.addListeners();
            await this.getNoteDetailsAsync();
            this.applySearch();
        });

        this.noteTitleChanged
            .pipe(debounceTime(this.saveTimeoutMilliseconds))
            .subscribe((finalNoteTitle) => {
                this.globalEmitter.emit(Constants.setNoteTitleEvent, this.noteId, this.initialNoteTitle, finalNoteTitle, this.setNoteTitleCallbackAsync.bind(this));
            });

        this.noteTextChanged
            .pipe(debounceTime(this.saveTimeoutMilliseconds))
            .subscribe(async (_) => {
                this.globalEmitter.emit(Constants.setNoteTextEvent, this.noteId, this.quill.getText(), this.getTasksCount(), this.setNoteTextCallbackAsync.bind(this));
            });

        this.saveChangesAndCloseNoteWindow
            .pipe(debounceTime(this.windowCloseTimeoutMilliseconds))
            .subscribe((_) => {
                this.saveAndClose();
            });

        document.onpaste = (e: ClipboardEvent) => {
            if (this.clipboard.containsImage()) {
                // Clipbaord contains image. Cancel default paste (it pastes the path to the image instead of the image data).
                e.preventDefault();

                // Execute our own paste, which pastes the image data.
                this.pasteImageFromClipboard();
            }
        }
    }

    public changeNotebook(): void {
        let dialogRef: MatDialogRef<ChangeNotebookDialogComponent> = this.dialog.open(ChangeNotebookDialogComponent, {
            width: '450px', data: { noteId: this.noteId }
        });
    }

    public onNotetitleChange(newNoteTitle: string) {
        this.isTitleDirty = true;
        this.clearSearch();
        this.noteTitleChanged.next(newNoteTitle);
    }

    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        if (this.settings.closeNotesWithEscape) {
            let window: BrowserWindow = remote.getCurrentWindow();
            window.close();
        }
    }

    // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    public beforeunloadHandler(event): void {
        this.logger.info(`Detected closing of note with id=${this.noteId}`, "NoteComponent", "beforeunloadHandler");

        // Prevents closing of the window
        if (this.isTitleDirty || this.isTextDirty) {
            this.isTitleDirty = false;
            this.isTextDirty = false;

            this.logger.info(`Note with id=${this.noteId} is dirty. Preventing close to save changes first.`, "NoteComponent", "beforeunloadHandler");
            event.preventDefault();
            event.returnValue = '';

            this.saveChangesAndCloseNoteWindow.next("");
        } else {
            this.logger.info(`Note with id=${this.noteId} is clean. Closing directly.`, "NoteComponent", "beforeunloadHandler");
            this.cleanup();
        }
    }

    public onTitleKeydown(event): void {
        if (event.key === "Enter" || event.key === "Tab") {
            // Make sure enter is not applied to the editor
            event.preventDefault();

            // Sets focus to editor when pressing enter on title
            this.quill.setSelection(0, 0);
        }
    }

    public toggleNoteMark(): void {
        this.hideActionButtonsDelayedAsync();
        this.globalEmitter.emit(Constants.setNoteMarkEvent, this.noteId, !this.isMarked);
    }

    public async exportNoteToPdfAsync(): Promise<void> {
        this.hideActionButtons();

        let options: SaveDialogOptions = { defaultPath: Utils.getPdfExportPath(remote.app.getPath('documents'), this.noteTitle) };
        let savePath: string = remote.dialog.showSaveDialog(null, options);

        if (savePath) {
            let content: any = {
                savePath: savePath,
                text: `<div>${this.createPrintCss()}<p class="page-title">${this.noteTitle}</p><p>${this.quill.root.innerHTML}</p></div>`
            }

            this.sendCommandToWorker("printPDF", content);
        }
    }

    public printNote(): void {
        this.hideActionButtons();
        this.sendCommandToWorker("print", `<div>${this.createPrintCss()}<p class="page-title">${this.noteTitle}</p><p>${this.quill.root.innerHTML}</p></div>`);
    }

    private createPrintCss(): string {
        // Font stacks from: https://gist.github.com/001101/a8b0e5ce8fd81225bed7
        return `<style type="text/css" scoped>
                    * {
                        font-family: Corbel, "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", "DejaVu Sans", "Bitstream Vera Sans", "Liberation Sans", Verdana, "Verdana Ref", sans serif;
                    }

                    body {
                        -webkit-print-color-adjust:exact;
                    }

                    h1,
                    a {
                        color: #1d7dd4;
                    }

                    h2{
                        color: #748393;
                    }

                    pre {
                        background-color: #f0f0f0;
                        border-radius: 3px;
                        white-space: pre-wrap;
                        margin: 5px 0 5px 0;
                        padding: 5px 10px;
                    }

                    pre.ql-syntax {
                        background-color: #23241f;
                        color: #f8f8f2;
                        overflow: visible;

                        font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
                    }

                    blockquote {
                        border-left: 4px solid #ccc;
                        margin: 5px 0 5px 0;
                        padding: 0 0 0 16px;
                    }

                    .page-title{
                        font-size: 30px;
                    }
                </style>`;
    }

    public async deleteNoteAsync(): Promise<void> {
        this.hideActionButtons();

        let title: string = await this.translator.getAsync('DialogTitles.ConfirmDeleteNote');
        let text: string = await this.translator.getAsync('DialogTexts.ConfirmDeleteNote', { noteTitle: this.noteTitle });

        let dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px', data: { dialogTitle: title, dialogText: text }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                this.globalEmitter.emit(Constants.deleteNoteEvent, this.noteId);

                let window: BrowserWindow = remote.getCurrentWindow();
                window.close();
            }
        });
    }

    public onFixedContentClick(): void {
        this.hideActionButtons();
    }

    public toggleShowActions(): void {
        this.canPerformActions = !this.canPerformActions;
        this.rotateActionsButton();
    }

    public rotateActionsButton(): void {
        this.actionIconRotation = this.canPerformActions ? 'rotated' : 'default';
    }

    public async exportNoteAsync(): Promise<void> {
        this.hideActionButtons();
        this.isBusy = true;

        let options: SaveDialogOptions = { defaultPath: Utils.getNoteExportPath(remote.app.getPath('documents'), this.noteTitle) };
        let savePath: string = remote.dialog.showSaveDialog(null, options);
        let noteExport: NoteExport = new NoteExport(this.noteTitle, this.quill.getText(), JSON.stringify(this.quill.getContents()));

        try {
            if (savePath) {
                await fs.writeFile(savePath, JSON.stringify(noteExport));
                this.snackBar.noteExportedAsync(this.noteTitle);
            }

            this.isBusy = false;
        } catch (error) {
            this.isBusy = false;
            this.logger.error(`An error occurred while exporting the note with title '${this.noteTitle}'. Cause: ${error}`, "NoteComponent", "exportNoteAsync");

            let errorText: string = (await this.translator.getAsync('ErrorTexts.ExportNoteError', { noteTitle: this.noteTitle }));

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: errorText }
            });
        }
    }

    private async addContextMenuAsync() {
        this.contextMenu = new remote.Menu();
        this.cutContextMenuItem = new remote.MenuItem({ label: await this.translator.getAsync('ContextMenu.Cut'), click: () => { this.performCut(); } });
        this.copyContextMenuItem = new remote.MenuItem({ label: await this.translator.getAsync('ContextMenu.Copy'), click: () => { this.performCopy(); } });
        this.pasteContextMenuItem = new remote.MenuItem({ label: await this.translator.getAsync('ContextMenu.Paste'), click: () => { this.performPaste(); } });
        this.deleteContextMenuItem = new remote.MenuItem({ label: await this.translator.getAsync('ContextMenu.Delete'), click: () => { this.performDelete(); } });

        this.contextMenu.append(this.cutContextMenuItem);
        this.contextMenu.append(this.copyContextMenuItem);
        this.contextMenu.append(this.pasteContextMenuItem);
        this.contextMenu.append(this.deleteContextMenuItem);

        let editor: HTMLElement = document.getElementById("editor");

        editor.removeEventListener('contextmenu', this.contextMenuListener.bind(this));
        editor.addEventListener('contextmenu', this.contextMenuListener.bind(this), false);
    }

    private contextMenuListener(e: MouseEvent): void {
        e.preventDefault();
        this.updateContextMenuItemsEnabledState();
        this.contextMenu.popup({ window: remote.getCurrentWindow() });
    }

    private hasSelectedRange(): boolean {
        let range: any = this.quill.getSelection();

        if (range && range.length > 0) {
            return true;
        }

        return false;
    }

    private updateContextMenuItemsEnabledState() {

        // Cut, Copy, Delete.
        let hasSelectedText: boolean = this.hasSelectedRange();
        this.cutContextMenuItem.enabled = hasSelectedText;
        this.copyContextMenuItem.enabled = hasSelectedText;
        this.deleteContextMenuItem.enabled = hasSelectedText;

        // Paste (checking for text on the clipboard also retruns true for images)
        this.pasteContextMenuItem.enabled = this.clipboard.containsText();
    }

    private performCut(): void {
        let range: any = this.quill.getSelection();

        if (!range || range.length === 0) {
            return;
        }

        let text: string = this.quill.getText(range.index, range.length);
        this.clipboard.writeText(text);
        this.quill.deleteText(range.index, range.length);
    }

    private performCopy(): void {
        let range: any = this.quill.getSelection();

        if (!range || range.length === 0) {
            return;
        }

        let text: string = this.quill.getText(range.index, range.length);
        this.clipboard.writeText(text);
    }

    private pasteImageFromClipboard(): void {
        try {
            this.insertImage(this.clipboard.readImage());
        } catch (error) {
            this.logger.error("Could not paste as image", "NoteComponent", "performPaste");
        }
    }

    private pastTextFromClipboard(): void {
        let range: any = this.quill.getSelection();

        if (!range) {
            return;
        }

        let clipboardText: string = this.clipboard.readText();

        if (clipboardText) {
            this.quill.insertText(range.index, clipboardText);
        }
    }

    private performPaste(): void {
        if (this.clipboard.containsImage()) {
            // Image found on clipboard. Try to paste as JPG.
            this.pasteImageFromClipboard();
        }
        else {
            // No image found on clipboard. Try to paste as text.
            this.pastTextFromClipboard();
        }
    }

    private performDelete(): void {
        let range: any = this.quill.getSelection();

        if (!range || range.length === 0) {
            return;
        }

        this.quill.deleteText(range.index, range.length);
    }

    private removeListeners(): void {
        this.globalEmitter.removeListener(Constants.noteMarkChangedEvent, this.noteMarkChangedListener);
        this.globalEmitter.removeListener(Constants.notebookChangedEvent, this.notebookChangedListener);
        this.globalEmitter.removeListener(Constants.focusNoteEvent, this.focusNoteListener);
        this.globalEmitter.removeListener(Constants.closeNoteEvent, this.closeNoteListener);
        this.globalEmitter.removeListener(Constants.languageChangedEvent, this.languageChangedListener);
        this.globalEmitter.removeListener(Constants.fontSizeChangedEvent, this.fontSizeChangedListener);
    }

    private addListeners(): void {
        this.globalEmitter.on(Constants.noteMarkChangedEvent, this.noteMarkChangedListener);
        this.globalEmitter.on(Constants.notebookChangedEvent, this.notebookChangedListener);
        this.globalEmitter.on(Constants.focusNoteEvent, this.focusNoteListener);
        this.globalEmitter.on(Constants.closeNoteEvent, this.closeNoteListener);
        this.globalEmitter.on(Constants.languageChangedEvent, this.languageChangedListener);
        this.globalEmitter.on(Constants.fontSizeChangedEvent, this.fontSizeChangedListener);
    }

    private cleanup(): void {
        this.globalEmitter.emit(Constants.setNoteOpenEvent, this.noteId, false);
        this.removeListeners();
    }

    private insertImage(file: any): void {
        let reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
            let img: HTMLImageElement = document.createElement('img');
            img.src = e.target.result;

            let range: Range = window.getSelection().getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
        };

        reader.readAsDataURL(file);
    }

    private saveAndClose(): void {
        this.globalEmitter.emit(Constants.setNoteTitleEvent, this.noteId, this.initialNoteTitle, this.noteTitle, async (result: NoteOperationResult) => {
            let setTitleOperation: Operation = result.operation;
            await this.setNoteTitleCallbackAsync(result);

            this.globalEmitter.emit(Constants.setNoteTextEvent, this.noteId, this.quill.getText(), this.getTasksCount(), async (operation: Operation) => {
                let setTextOperation: Operation = operation;
                await this.setNoteTextCallbackAsync(operation);

                // Close is only allowed when saving both title and text is successful
                if (setTitleOperation === Operation.Success && setTextOperation === Operation.Success) {
                    this.logger.info(`Closing note with id=${this.noteId} after saving changes.`, "NoteComponent", "saveAndClose");
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

            this.setWindowTitle(result.noteTitle);
        });
    }

    private getNotebookNameCallback(result: NoteDetailsResult) {
        this.zone.run(() => {
            this.notebookName = result.notebookName;
        });
    }

    private setEditorFontSize(): void {
        document.body.setAttribute('editor-font-size', this.settings.fontSizeInNotes.toString());
    }

    private setWindowTitle(noteTitle: string): void {
        let window: BrowserWindow = remote.getCurrentWindow();
        window.setTitle(noteTitle);
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

    private focusNoteHandler(noteId: string): void {
        if (this.noteId === noteId) {
            let window: BrowserWindow = remote.getCurrentWindow();

            if (window.isMinimized()) {
                window.minimize(); // Workaround for notes not getting restored on Linux
                window.restore();
            }

            window.focus();
        }
    }

    private closeNoteHandler(noteId: string): void {
        if (this.noteId === noteId) {
            let window: BrowserWindow = remote.getCurrentWindow();
            window.close();
        }
    }

    private languageChangedHandler(noteId: string): void {
        this.getNotebookName();
        this.addContextMenuAsync();
    }

    private fontSizeChangedHandler(): void {
        this.setEditorFontSize();
    }

    private clearSearch(): void {
        let window: BrowserWindow = remote.getCurrentWindow();
        window.webContents.stopFindInPage("keepSelection");
    }

    private applySearch() {
        this.globalEmitter.emit(Constants.getSearchTextEvent, this.getSearchTextCallback.bind(this));
    }

    private getSearchTextCallback(searchText: string): void {
        let window: BrowserWindow = remote.getCurrentWindow();

        // window.webContents.stopFindInPage("keepSelection");

        if (searchText && searchText.length > 0) {
            let searchTextPieces: string[] = searchText.trim().split(" ");
            // For now, we can only search for 1 word.
            window.webContents.findInPage(searchTextPieces[0]);
        }
    }

    private handleNoteMarkToggled(isNoteMarked: boolean) {
        this.zone.run(() => this.isMarked = isNoteMarked);
    }

    private async setNoteTitleCallbackAsync(result: NoteOperationResult): Promise<void> {
        if (result.operation === Operation.Blank) {
            this.zone.run(() => this.noteTitle = this.initialNoteTitle);
            this.snackBar.noteTitleCannotBeEmptyAsync();
        } else if (result.operation === Operation.Error) {
            this.zone.run(() => this.noteTitle = this.initialNoteTitle);
            let errorText: string = await this.translator.getAsync('ErrorTexts.RenameNoteError', { noteTitle: this.initialNoteTitle });

            this.zone.run(() => {
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px', data: { errorText: errorText }
                });
            });
        } else if (result.operation === Operation.Success) {
            this.zone.run(() => {
                this.initialNoteTitle = result.noteTitle;
                this.noteTitle = result.noteTitle;
                this.setWindowTitle(result.noteTitle);
            });
        } else {
            // Do nothing
        }

        this.isTitleDirty = false;
    }

    private writeTextToNoteFile(): void {
        // Update the note file on disk
        let activeCollection: string = this.settings.activeCollection;
        let storageDirectory: string = this.settings.storageDirectory;
        let jsonContent: string = JSON.stringify(this.quill.getContents());
        fs.writeFileSync(path.join(Utils.collectionToPath(storageDirectory, activeCollection), `${this.noteId}${Constants.noteContentExtension}`), jsonContent);
    }

    private async setNoteTextCallbackAsync(operation: Operation): Promise<void> {
        let showErrorDialog: boolean = false;

        if (operation === Operation.Success) {
            try {
                this.writeTextToNoteFile();
            } catch (error) {
                this.logger.error(`Could not set text for the note with id='${this.noteId}' in the note file. Cause: ${error}`, "NoteComponent", "setNoteTextCallbackAsync");
                showErrorDialog = true;
            }
        } else if (operation === Operation.Error) {
            showErrorDialog = true;
        } else {
            // Do nothing
        }

        if (showErrorDialog) {
            let errorText: string = await this.translator.getAsync('ErrorTexts.UpdateNoteContentError');

            this.zone.run(() => {
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px', data: { errorText: errorText }
                });
            });
        }

        this.isTextDirty = false;
    }

    private async getNoteDetailsAsync(): Promise<void> {
        // Details from data store
        while (!this.noteTitle) {
            // While, is a workaround for auto reload. CollectionService is not ready to
            // listen to events after a auto reload. So we keep trying, until it responds.
            await Utils.sleep(50);
            this.globalEmitter.emit(Constants.getNoteDetailsEvent, this.noteId, this.getNoteDetailsCallback.bind(this));
        }

        // Details from note file
        try {
            let activeCollection: string = this.settings.activeCollection;
            let storageDirectory: string = this.settings.storageDirectory;
            let noteContent: string = fs.readFileSync(path.join(Utils.collectionToPath(storageDirectory, activeCollection), `${this.noteId}${Constants.noteContentExtension}`), 'utf8');

            if (noteContent) {
                // We can only parse to json if there is content
                this.quill.setContents(JSON.parse(noteContent), 'silent');
            }
        } catch (error) {
            this.logger.error(`Could not get the content for the note with id='${this.noteId}'. Cause: ${error}`, "NoteComponent", "getNoteDetailsAsync");

            let errorText: string = await this.translator.getAsync('ErrorTexts.GetNoteContentError');

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: errorText }
            });
        }
    }

    private getNotebookName(): void {
        this.globalEmitter.emit(Constants.getNoteDetailsEvent, this.noteId, this.getNotebookNameCallback.bind(this));
    }

    private hideActionButtons(): void {
        this.canPerformActions = false;
        this.rotateActionsButton();

    }

    private async hideActionButtonsDelayedAsync(): Promise<void> {
        await Utils.sleep(500);
        this.canPerformActions = false;
        this.rotateActionsButton();
    }

    private sendCommandToWorker(command: string, content: any): void {
        ipcRenderer.send(command, content);
    }

    public strikeThrough(event: any) {
        let range: any = this.quill.getSelection();
        let format: any = this.quill.getFormat(range.index, range.length);
        let formatString: string = JSON.stringify(format);

        let applyStrikeThrough: boolean = !formatString.includes("strike");
        this.quill.formatText(range.index, range.length, 'strike', applyStrikeThrough);
    }

    private getTasksCount(): TasksCount {
        let noteContent: string = JSON.stringify(this.quill.getContents());
        let openTasksCount: number = (noteContent.match(/"list":"unchecked"/g) || []).length;
        let closedTasksCount: number = (noteContent.match(/"list":"checked"/g) || []).length;

        return new TasksCount(openTasksCount, closedTasksCount);
    }
}
