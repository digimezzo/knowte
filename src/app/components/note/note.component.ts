import { Component, OnInit, OnDestroy, HostListener, NgZone, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { remote, BrowserWindow, SaveDialogOptions } from 'electron';
import { ActivatedRoute } from '@angular/router';
import { NoteDetailsResult } from '../../services/results/note-details-result';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Constants } from '../../core/constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators';
import { Operation } from '../../core/enums';
import { NoteOperationResult } from '../../services/results/note-operation-result';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
import * as Quill from 'quill';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Utils } from '../../core/utils';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { NoteExport } from '../../core/note-export';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TasksCount } from '../../core/tasks-count';
import { Logger } from '../../core/logger';
import { TranslatorService } from '../../services/translator/translator.service';
import { ClipboardManager } from '../../core/clipboard-manager';
import { WorkerManager } from '../../core/worker-manager';
import { Settings } from '../../core/settings';
import { AppearanceService } from '../../services/appearance/appearance.service';
import * as electronLocalshortcut from 'electron-localshortcut';

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
    @ViewChild('searchInput', { static: false }) public searchInputElement: ElementRef;

    private saveTimeoutMilliseconds: number = 5000;
    private windowCloseTimeoutMilliseconds: number = 500;
    private quill: Quill;
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private isTitleDirty: boolean = false;
    private isTextDirty: boolean = false;
    private noteMarkChangedListener: any = this.noteMarkChangedHandler.bind(this);
    private focusNoteListener: any = this.focusNoteHandler.bind(this);
    private closeNoteListener: any = this.closeNoteHandler.bind(this);
    private languageChangedListener: any = this.languageChangedHandler.bind(this);
    private fontSizeChangedListener: any = this.fontSizeChangedHandler.bind(this);
    private searchInputFocusOutListener: any = this.searchInputFocusOutHandler.bind(this);

    private contextMenu: any;
    private cutContextMenuItem: any;
    private copyContextMenuItem: any;
    private pasteContextMenuItem: any;
    private deleteContextMenuItem: any;

    private _searchText: string;

    private isSearchInputFocusOutHandlerSet: boolean = false;

    public searchPlaceHolder: string = '';

    constructor(private activatedRoute: ActivatedRoute, private zone: NgZone, private dialog: MatDialog, private logger: Logger,
        private snackBar: SnackBarService, private translator: TranslatorService, private settings: Settings,
        public appearance: AppearanceService, private clipboard: ClipboardManager, private worker: WorkerManager) {
    }

    public noteId: string;
    public initialNoteTitle: string;
    public noteTitle: string;
    public isMarked: boolean;
    public noteTitleChanged: Subject<string> = new Subject<string>();
    public noteTextChanged: Subject<string> = new Subject<string>();
    public saveChangesAndCloseNoteWindow: Subject<string> = new Subject<string>();
    public canPerformActions: boolean = false;
    public isBusy: boolean = false;
    public actionIconRotation: string = 'default';
    public canSearch: boolean = false;

    public get searchText(): string {
        return this._searchText;
    }
    public set searchText(v: string) {
        this._searchText = v;
        this.highlightSearch(v);
    }

    public ngOnDestroy(): void {
        this.removeSearchInputFocusOutHandler();
    }

    public async ngOnInit(): Promise<void> {
        this.setEditorFontSize();
        this.addContextMenuAsync();
        await this.checkSearchPlaceHolderAsync();

        const notePlaceHolder: string = await this.translator.getAsync('Notes.NotePlaceholder');

        const toolbarOptions: any = [
            [
                'bold', 'italic', 'underline', 'strike',
                { 'background': [] },
                { 'header': 1 }, { 'header': 2 },
                { 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' },
                'link', 'blockquote', 'code-block', 'image',
                'clean'
            ]
        ];

        this.quill = new Quill('#editor', {
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: notePlaceHolder,
            theme: 'snow',
        });

        await this.setToolbarTooltipsAsync();

        this.quill.on('text-change', () => {
            this.isTextDirty = true;
            this.clearSearch();
            this.noteTextChanged.next('');

        });

        // Forces paste of unformatted text
        // (See: https://stackoverflow.com/questions/41237486/how-to-paste-plain-text-in-a-quill-based-editor)
        this.quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
            const plaintext = node.innerText;
            const Delta = Quill.import('delta');
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
                this.globalEmitter.emit(
                    Constants.setNoteTitleEvent,
                    this.noteId,
                    this.initialNoteTitle,
                    finalNoteTitle,
                    this.setNoteTitleCallbackAsync.bind(this));
            });

        this.noteTextChanged
            .pipe(debounceTime(this.saveTimeoutMilliseconds))
            .subscribe(async (_) => {
                this.globalEmitter.emit(
                    Constants.setNoteTextEvent,
                    this.noteId,
                    this.quill.getText(),
                    this.getTasksCount(),
                    this.setNoteTextCallbackAsync.bind(this));
            });

        this.saveChangesAndCloseNoteWindow
            .pipe(debounceTime(this.windowCloseTimeoutMilliseconds))
            .subscribe((_) => {
                this.saveAndClose();
            });

        document.onpaste = (e: ClipboardEvent) => {
            if (this.clipboard.containsImage()) {
                // Clipboard contains image. Cancel default paste (it pastes the path to the image instead of the image data).
                e.preventDefault();

                // Execute our own paste, which pastes the image data.
                this.pasteImageFromClipboard();
            }
        };

        const window: BrowserWindow = remote.getCurrentWindow();

        electronLocalshortcut.register(window, 'Ctrl+F', () => {
            this.showSearch();
        });

        electronLocalshortcut.register(window, 'ESC', () => {
            if (this.canSearch) {
                this.closeSearch();
            } else if (this.settings.closeNotesWithEscape) {
                window.close();
            }
        });
    }

    private async setToolbarTooltipsAsync(): Promise<void> {
        // See: https://github.com/quilljs/quill/issues/650
        const toolbarElement: Element = document.querySelector('.ql-toolbar');
        toolbarElement.querySelector('span.ql-background').setAttribute('title', await this.translator.getAsync('Tooltips.Highlight'));
        toolbarElement.querySelector('button.ql-bold').setAttribute('title', await this.translator.getAsync('Tooltips.Bold'));
        toolbarElement.querySelector('button.ql-italic').setAttribute('title', await this.translator.getAsync('Tooltips.Italic'));
        toolbarElement.querySelector('button.ql-underline').setAttribute('title', await this.translator.getAsync('Tooltips.Underline'));
        toolbarElement.querySelector('button.ql-strike').setAttribute('title', await this.translator.getAsync('Tooltips.Strikethrough'));

        toolbarElement.querySelector('[class="ql-header"][value="1"]')
            .setAttribute('title', await this.translator.getAsync('Tooltips.Heading1'));
        toolbarElement.querySelector('[class="ql-header"][value="2"]')
            .setAttribute('title', await this.translator.getAsync('Tooltips.Heading2'));

        toolbarElement.querySelector('[class="ql-list"][value="ordered"]')
            .setAttribute('title', await this.translator.getAsync('Tooltips.NumberedList'));
        toolbarElement.querySelector('[class="ql-list"][value="bullet"]')
            .setAttribute('title', await this.translator.getAsync('Tooltips.BulletedList'));
        toolbarElement.querySelector('[class="ql-list"][value="check"]')
            .setAttribute('title', await this.translator.getAsync('Tooltips.TaskList'));

        toolbarElement.querySelector('button.ql-link').setAttribute('title', await this.translator.getAsync('Tooltips.Link'));
        toolbarElement.querySelector('button.ql-blockquote').setAttribute('title', await this.translator.getAsync('Tooltips.Quote'));
        toolbarElement.querySelector('button.ql-code-block').setAttribute('title', await this.translator.getAsync('Tooltips.Code'));
        toolbarElement.querySelector('button.ql-image').setAttribute('title', await this.translator.getAsync('Tooltips.Image'));

        toolbarElement.querySelector('button.ql-clean').setAttribute('title', await this.translator.getAsync('Tooltips.ClearFormatting'));
    }

    public onNotetitleChange(newNoteTitle: string): void {
        this.isTitleDirty = true;
        this.clearSearch();
        this.noteTitleChanged.next(newNoteTitle);
    }

    // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    public beforeunloadHandler(event: any): void {
        this.logger.info(`Detected closing of note with id=${this.noteId}`, 'NoteComponent', 'beforeunloadHandler');

        // Prevents closing of the window
        if (this.isTitleDirty || this.isTextDirty) {
            this.isTitleDirty = false;
            this.isTextDirty = false;

            this.logger.info(
                `Note with id=${this.noteId} is dirty. Preventing close to save changes first.`,
                'NoteComponent',
                'beforeunloadHandler');
            event.preventDefault();
            event.returnValue = '';

            this.saveChangesAndCloseNoteWindow.next('');
        } else {
            this.logger.info(`Note with id=${this.noteId} is clean. Closing directly.`, 'NoteComponent', 'beforeunloadHandler');
            this.cleanup();
        }
    }

    public onTitleKeydown(event: any): void {
        if (event.key === 'Enter' || event.key === 'Tab') {
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

        const options: SaveDialogOptions = { defaultPath: Utils.getPdfExportPath(remote.app.getPath('documents'), this.noteTitle) };
        const savePath: string = remote.dialog.showSaveDialog(null, options);

        if (savePath) {
            this.worker.exportToPdf(savePath, this.noteTitle, this.quill.root.innerHTML);
        }
    }

    public printNote(): void {
        this.hideActionButtons();
        this.worker.print(this.noteTitle, this.quill.root.innerHTML);
    }

    public async deleteNoteAsync(): Promise<void> {
        this.hideActionButtons();

        const title: string = await this.translator.getAsync('DialogTitles.ConfirmDeleteNote');
        const text: string = await this.translator.getAsync('DialogTexts.ConfirmDeleteNote', { noteTitle: this.noteTitle });

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px', data: { dialogTitle: title, dialogText: text }
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                this.globalEmitter.emit(Constants.deleteNoteEvent, this.noteId);

                const window: BrowserWindow = remote.getCurrentWindow();
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

        const options: SaveDialogOptions = { defaultPath: Utils.getNoteExportPath(remote.app.getPath('documents'), this.noteTitle) };
        const savePath: string = remote.dialog.showSaveDialog(null, options);
        const noteExport: NoteExport = new NoteExport(this.noteTitle, this.quill.getText(), JSON.stringify(this.quill.getContents()));

        try {
            if (savePath) {
                await fs.writeFile(savePath, JSON.stringify(noteExport));
                this.snackBar.noteExportedAsync(this.noteTitle);
            }

            this.isBusy = false;
        } catch (error) {
            this.isBusy = false;
            this.logger.error(
                `An error occurred while exporting the note with title '${this.noteTitle}'. Cause: ${error}`,
                'NoteComponent',
                'exportNoteAsync');

            const errorText: string = (await this.translator.getAsync('ErrorTexts.ExportNoteError', { noteTitle: this.noteTitle }));

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: errorText }
            });
        }
    }

    private async addContextMenuAsync(): Promise<void> {
        this.contextMenu = new remote.Menu();

        this.cutContextMenuItem = new remote.MenuItem({
            label: await this.translator.getAsync('ContextMenu.Cut'),
            click: () => {
                this.performCut();
            }
        });

        this.copyContextMenuItem = new remote.MenuItem({
            label: await this.translator.getAsync('ContextMenu.Copy'),
            click: () => {
                this.performCopy();
            }
        });

        this.pasteContextMenuItem = new remote.MenuItem({
            label: await this.translator.getAsync('ContextMenu.Paste'),
            click: () => {
                this.performPaste();
            }
        });

        this.deleteContextMenuItem = new remote.MenuItem({
            label: await this.translator.getAsync('ContextMenu.Delete'),
            click: () => {
                this.performDelete();
            }
        });

        this.contextMenu.append(this.cutContextMenuItem);
        this.contextMenu.append(this.copyContextMenuItem);
        this.contextMenu.append(this.pasteContextMenuItem);
        this.contextMenu.append(this.deleteContextMenuItem);

        const editor: HTMLElement = document.getElementById('editor');

        editor.removeEventListener('contextmenu', this.contextMenuListener.bind(this));
        editor.addEventListener('contextmenu', this.contextMenuListener.bind(this), false);
    }

    private contextMenuListener(e: MouseEvent): void {
        e.preventDefault();
        this.updateContextMenuItemsEnabledState();
        this.contextMenu.popup({ window: remote.getCurrentWindow() });
    }

    private hasSelectedRange(): boolean {
        const range: any = this.quill.getSelection();

        if (range && range.length > 0) {
            return true;
        }

        return false;
    }

    private updateContextMenuItemsEnabledState(): void {
        // Cut, Copy, Delete.
        const hasSelectedText: boolean = this.hasSelectedRange();
        this.cutContextMenuItem.enabled = hasSelectedText;
        this.copyContextMenuItem.enabled = hasSelectedText;
        this.deleteContextMenuItem.enabled = hasSelectedText;

        // Paste (checking for text on the clipboard also retruns true for images)
        this.pasteContextMenuItem.enabled = this.clipboard.containsText();
    }

    private performCut(): void {
        const range: any = this.quill.getSelection();

        if (!range || range.length === 0) {
            return;
        }

        const text: string = this.quill.getText(range.index, range.length);
        this.clipboard.writeText(text);
        this.quill.deleteText(range.index, range.length);
    }

    private performCopy(): void {
        const range: any = this.quill.getSelection();

        if (!range || range.length === 0) {
            return;
        }

        const text: string = this.quill.getText(range.index, range.length);
        this.clipboard.writeText(text);
    }

    private pasteImageFromClipboard(): void {
        try {
            this.insertImage(this.clipboard.readImage());
        } catch (error) {
            this.logger.error('Could not paste as image', 'NoteComponent', 'performPaste');
        }
    }

    private pastTextFromClipboard(): void {
        const range: any = this.quill.getSelection();

        if (!range) {
            return;
        }

        const clipboardText: string = this.clipboard.readText();

        if (clipboardText) {
            this.quill.insertText(range.index, clipboardText);
        }
    }

    private performPaste(): void {
        if (this.clipboard.containsImage()) {
            // Image found on clipboard. Try to paste as JPG.
            this.pasteImageFromClipboard();
        } else {
            // No image found on clipboard. Try to paste as text.
            this.pastTextFromClipboard();
        }
    }

    private performDelete(): void {
        const range: any = this.quill.getSelection();

        if (!range || range.length === 0) {
            return;
        }

        this.quill.deleteText(range.index, range.length);
    }

    private removeListeners(): void {
        this.globalEmitter.removeListener(Constants.noteMarkChangedEvent, this.noteMarkChangedListener);
        this.globalEmitter.removeListener(Constants.focusNoteEvent, this.focusNoteListener);
        this.globalEmitter.removeListener(Constants.closeNoteEvent, this.closeNoteListener);
        this.globalEmitter.removeListener(Constants.languageChangedEvent, this.languageChangedListener);
        this.globalEmitter.removeListener(Constants.noteFontSizeChangedEvent, this.fontSizeChangedListener);
    }

    private addListeners(): void {
        this.globalEmitter.on(Constants.noteMarkChangedEvent, this.noteMarkChangedListener);
        this.globalEmitter.on(Constants.focusNoteEvent, this.focusNoteListener);
        this.globalEmitter.on(Constants.closeNoteEvent, this.closeNoteListener);
        this.globalEmitter.on(Constants.languageChangedEvent, this.languageChangedListener);
        this.globalEmitter.on(Constants.noteFontSizeChangedEvent, this.fontSizeChangedListener);
    }

    private cleanup(): void {
        this.globalEmitter.emit(Constants.setNoteOpenEvent, this.noteId, false);
        this.removeListeners();
    }

    private insertImage(file: any): void {
        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
            const img: HTMLImageElement = document.createElement('img');
            img.src = e.target.result;

            const range: Range = window.getSelection().getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
        };

        reader.readAsDataURL(file);
    }

    private saveAndClose(): void {
        this.globalEmitter.emit(
            Constants.setNoteTitleEvent,
            this.noteId,
            this.initialNoteTitle,
            this.noteTitle,
            async (result: NoteOperationResult) => {
                const setTitleOperation: Operation = result.operation;
                await this.setNoteTitleCallbackAsync(result);

                this.globalEmitter.emit(
                    Constants.setNoteTextEvent,
                    this.noteId,
                    this.quill.getText(),
                    this.getTasksCount(),
                    async (operation: Operation) => {
                        const setTextOperation: Operation = operation;
                        await this.setNoteTextCallbackAsync(operation);

                        // Close is only allowed when saving both title and text is successful
                        if (setTitleOperation === Operation.Success && setTextOperation === Operation.Success) {
                            this.logger.info(`Closing note with id=${this.noteId} after saving changes.`, 'NoteComponent', 'saveAndClose');
                            this.cleanup();
                            const window: BrowserWindow = remote.getCurrentWindow();
                            window.close();
                        }
                    });
            });
    }

    private getNoteDetailsCallback(result: NoteDetailsResult): void {
        this.zone.run(() => {
            this.initialNoteTitle = result.noteTitle;
            this.noteTitle = result.noteTitle;
            this.isMarked = result.isMarked;

            this.setWindowTitle(result.noteTitle);
        });
    }

    private setEditorFontSize(): void {
        document.body.setAttribute('editor-font-size', this.settings.fontSizeInNotes.toString());
    }

    private setWindowTitle(noteTitle: string): void {
        const window: BrowserWindow = remote.getCurrentWindow();
        window.setTitle(`${Constants.applicationName} - ${noteTitle}`);
    }

    private noteMarkChangedHandler(noteId: string, isMarked: boolean): void {
        if (this.noteId === noteId) {
            this.zone.run(() => this.isMarked = isMarked);
        }
    }

    private focusNoteHandler(noteId: string): void {
        if (this.noteId === noteId) {
            const window: BrowserWindow = remote.getCurrentWindow();

            if (window.isMinimized()) {
                window.minimize(); // Workaround for notes not getting restored on Linux
                window.restore();
            }

            window.focus();
        }
    }

    private closeNoteHandler(noteId: string): void {
        if (this.noteId === noteId) {
            const window: BrowserWindow = remote.getCurrentWindow();
            window.close();
        }
    }

    private languageChangedHandler(noteId: string): void {
        this.addContextMenuAsync();
    }

    private fontSizeChangedHandler(): void {
        this.setEditorFontSize();
    }

    private searchInputFocusOutHandler(): void {
        if (this.searchInputElement) {
            this.searchInputElement.nativeElement.focus();
        }
    }

    private showSearch(): void {
        this.canSearch = true;

        setTimeout(() => {
            this.searchInputElement.nativeElement.focus();
            this.addSearchInputFocusOutHandler();
        }, 100);
    }

    public closeSearch(): void {
        this.removeSearchInputFocusOutHandler();
        this.clearSearch();
        this.canSearch = false;
    }

    public clearSearch(): void {
        const window: BrowserWindow = remote.getCurrentWindow();
        window.webContents.stopFindInPage('keepSelection');
        this.searchText = '';
    }

    private applySearch(): void {
        this.globalEmitter.emit(Constants.getSearchTextEvent, this.getSearchTextCallback.bind(this));
    }

    private getSearchTextCallback(searchText: string): void {
        if (searchText && searchText.length > 0) {
            this.showSearch();

            const searchTextPieces: string[] = searchText.trim().split(' ');

            // For now, we can only search for 1 word.
            this.searchText = searchTextPieces[0];
        }
    }
    private removeSearchInputFocusOutHandler(): void {
        if (this.searchInputElement) {
            this.searchInputElement.nativeElement.removeEventListener('focusout', this.searchInputFocusOutListener.bind(this));
            this.isSearchInputFocusOutHandlerSet = false;
        }
    }

    private addSearchInputFocusOutHandler(): void {
        if (!this.isSearchInputFocusOutHandlerSet) {
            if (this.searchInputElement) {
                this.searchInputElement.nativeElement.addEventListener('focusout', this.searchInputFocusOutListener.bind(this));
                this.isSearchInputFocusOutHandlerSet = true;
            }
        }
    }

    private highlightSearch(searchText: string): void {
        const window: BrowserWindow = remote.getCurrentWindow();

        if (this.searchText) {
            window.webContents.findInPage(this.searchText);
        } else {
            window.webContents.stopFindInPage('keepSelection');
        }
    }

    private handleNoteMarkToggled(isNoteMarked: boolean): void {
        this.zone.run(() => this.isMarked = isNoteMarked);
    }

    private async setNoteTitleCallbackAsync(result: NoteOperationResult): Promise<void> {
        if (result.operation === Operation.Blank) {
            this.zone.run(() => this.noteTitle = this.initialNoteTitle);
            this.snackBar.noteTitleCannotBeEmptyAsync();
        } else if (result.operation === Operation.Error) {
            this.zone.run(() => this.noteTitle = this.initialNoteTitle);
            const errorText: string = await this.translator.getAsync('ErrorTexts.RenameNoteError', { noteTitle: this.initialNoteTitle });

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
        const activeCollection: string = this.settings.activeCollection;
        const storageDirectory: string = this.settings.storageDirectory;
        const jsonContent: string = JSON.stringify(this.quill.getContents());
        fs.writeFileSync(
            path.join(Utils.collectionToPath(storageDirectory, activeCollection), `${this.noteId}${Constants.noteContentExtension}`),
            jsonContent);
    }

    private async setNoteTextCallbackAsync(operation: Operation): Promise<void> {
        let showErrorDialog = false;

        if (operation === Operation.Success) {
            try {
                this.writeTextToNoteFile();
            } catch (error) {
                this.logger.error(
                    `Could not set text for the note with id='${this.noteId}' in the note file. Cause: ${error}`,
                    'NoteComponent',
                    'setNoteTextCallbackAsync');
                showErrorDialog = true;
            }
        } else if (operation === Operation.Error) {
            showErrorDialog = true;
        } else {
            // Do nothing
        }

        if (showErrorDialog) {
            const errorText: string = await this.translator.getAsync('ErrorTexts.UpdateNoteContentError');

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
            const activeCollection: string = this.settings.activeCollection;
            const storageDirectory: string = this.settings.storageDirectory;
            const noteContent: string = fs.readFileSync(
                path.join(Utils.collectionToPath(storageDirectory, activeCollection), `${this.noteId}${Constants.noteContentExtension}`),
                'utf8');

            if (noteContent) {
                // We can only parse to json if there is content
                this.quill.setContents(JSON.parse(noteContent), 'silent');
            }
        } catch (error) {
            this.logger.error(
                `Could not get the content for the note with id='${this.noteId}'. Cause: ${error}`,
                'NoteComponent',
                'getNoteDetailsAsync');

            const errorText: string = await this.translator.getAsync('ErrorTexts.GetNoteContentError');

            this.dialog.open(ErrorDialogComponent, {
                width: '450px', data: { errorText: errorText }
            });
        }
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

    public heading1(event: any): void {
        this.applyHeading(1);
    }

    public heading2(event: any): void {
        this.applyHeading(2);
    }

    private applyHeading(headingSize: number): void {
        const range: any = this.quill.getSelection();
        const format: any = this.quill.getFormat(range.index, range.length);
        const formatString: string = JSON.stringify(format);

        const selectionContainsHeader: boolean = !formatString.includes(`"header":${headingSize}`);

        if (selectionContainsHeader) {
            this.quill.format('header', headingSize);
        } else {
            this.quill.removeFormat(range.index, range.length);
        }
    }

    public strikeThrough(event: any): void {
        const range: any = this.quill.getSelection();
        const format: any = this.quill.getFormat(range.index, range.length);
        const formatString: string = JSON.stringify(format);

        const applyStrikeThrough: boolean = !formatString.includes('strike');
        this.quill.formatText(range.index, range.length, 'strike', applyStrikeThrough);
    }

    private getTasksCount(): TasksCount {
        const noteContent: string = JSON.stringify(this.quill.getContents());
        const openTasksCount: number = (noteContent.match(/"list":"unchecked"/g) || []).length;
        const closedTasksCount: number = (noteContent.match(/"list":"checked"/g) || []).length;

        return new TasksCount(openTasksCount, closedTasksCount);
    }

    public async checkSearchPlaceHolderAsync(): Promise<void> {
        if (this.searchPlaceHolder) {
            this.searchPlaceHolder = null;

            return;
        } else {
            this.searchPlaceHolder = await this.translator.getAsync('Notes.Search');

            return;
        }
    }
}
