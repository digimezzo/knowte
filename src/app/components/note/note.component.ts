import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import * as remote from '@electron/remote';
import { BrowserWindow, SaveDialogOptions, SaveDialogReturnValue } from 'electron';
import * as electronLocalShortcut from 'electron-localshortcut';
import * as Quill from 'quill';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators';
import { BaseSettings } from '../../core/base-settings';
import { ClipboardManager } from '../../core/clipboard-manager';
import { Constants } from '../../core/constants';
import { Operation } from '../../core/enums';
import { Logger } from '../../core/logger';
import { ProductInformation } from '../../core/product-information';
import { TasksCount } from '../../core/tasks-count';
import { Utils } from '../../core/utils';
import { AppearanceService } from '../../services/appearance/appearance.service';
import { CollectionClient } from '../../services/collection/collection.client';
import { CryptographyService } from '../../services/cryptography/cryptography.service';
import { PersistanceService } from '../../services/persistance/persistance.service';
import { PrintService } from '../../services/print/print.service';
import { NoteDetailsResult } from '../../services/results/note-details-result';
import { NoteMarkResult } from '../../services/results/note-mark-result';
import { NoteOperationResult } from '../../services/results/note-operation-result';
import { SearchClient } from '../../services/search/search.client';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { SpellCheckService } from '../../services/spell-check/spell-check.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
import { NotificationDialogComponent } from '../dialogs/notification-dialog/notification-dialog.component';
import { PasswordInputDialogComponent } from '../dialogs/password-input-dialog/password-input-dialog.component';
import { ContextMenuItemsEnabledState } from './context-menu-items-enabled-state';
import { NoteContextMenuFactory } from './note-context-menu-factory';
import { QuillFactory } from './quill-factory';
import { QuillTweaker } from './quill-tweaker';

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
            transition('default => rotated', animate('250ms ease-in')),
        ]),
    ],
})
export class NoteComponent implements OnInit {
    private quill: Quill;

    private subscription: Subscription = new Subscription();

    private isTitleDirty: boolean = false;
    private isTextDirty: boolean = false;

    private secretKey: string = '';
    private secretKeyHash: string = '';

    private noteWindow: BrowserWindow;

    constructor(
        private print: PrintService,
        private activatedRoute: ActivatedRoute,
        private zone: NgZone,
        private dialog: MatDialog,
        private logger: Logger,
        private snackBar: SnackBarService,
        private translator: TranslatorService,
        private cryptography: CryptographyService,
        private persistance: PersistanceService,
        public settings: BaseSettings,
        public appearance: AppearanceService,
        public spellCheckService: SpellCheckService,
        private clipboard: ClipboardManager,
        private quillFactory: QuillFactory,
        private noteContextMenuFactory: NoteContextMenuFactory,
        private quillTweaker: QuillTweaker,
        private collectionClient: CollectionClient,
        private searchClient: SearchClient
    ) {}

    public isEncrypted: boolean = false;
    public noteId: string;
    public initialNoteTitle: string;
    public noteTitle: string;
    public isMarked: boolean;
    public noteTitleChanged: Subject<string> = new Subject<string>();
    public noteTextChanged: Subject<void> = new Subject<void>();
    public saveChangesAndCloseNoteWindow: Subject<void> = new Subject<void>();
    public canPerformActions: boolean = false;
    public isBusy: boolean = false;
    public actionIconRotation: string = 'default';
    public canSearch: boolean = false;

    public async ngOnInit(): Promise<void> {
        this.activatedRoute.queryParams.subscribe(async (params) => {
            this.noteId = params['id'];
            this.noteWindow = remote.getCurrentWindow();

            await this.getNoteDetailsAsync();
            await this.requestSecretKeyOrCloseNoteAsync();
            await this.configureQuillEditorAsync();
            this.setEditorZoomPercentage();
            this.addSubscriptions();
            this.addDocumentListeners();
            await this.getNoteContentAsync();
            await this.applySearchAsync();

            this.noteWindow.webContents.on('context-menu', (event, contextMenuParams) => {
                const hasSelectedText: boolean = this.hasSelectedRange();
                const contextMenuItemsEnabledState: ContextMenuItemsEnabledState = new ContextMenuItemsEnabledState(
                    hasSelectedText,
                    this.clipboard.containsText() || this.clipboard.containsImage()
                );
                this.noteContextMenuFactory.createAsync(
                    this.noteWindow.webContents,
                    contextMenuParams,
                    contextMenuItemsEnabledState,
                    this.performCut.bind(this),
                    this.performCopy.bind(this),
                    this.performPaste.bind(this),
                    this.performDelete.bind(this)
                );
            });
        });

        electronLocalShortcut.register(this.noteWindow, 'ESC', () => {
            if (this.settings.closeNotesWithEscape) {
                this.noteWindow.close();
            }
        });
    }

    private addSubscriptions(): void {
        this.noteTitleChanged.pipe(debounceTime(Constants.noteSaveTimeoutMilliseconds)).subscribe(async (finalNoteTitle) => {
            await this.setNoteTitleAsync(finalNoteTitle);
        });

        this.noteTextChanged.pipe(debounceTime(Constants.noteSaveTimeoutMilliseconds)).subscribe(async () => {
            await this.setNoteTextAsync();
        });

        this.saveChangesAndCloseNoteWindow.pipe(debounceTime(Constants.noteWindowCloseTimeoutMilliseconds)).subscribe(async () => {
            await this.saveAndCloseAsync();
        });

        this.subscription.add(this.collectionClient.closeNote$.subscribe((noteId: string) => this.closeNoteIfMatching(noteId)));
        this.subscription.add(this.collectionClient.closeAllNotes$.subscribe(() => this.closeNote()));
        this.subscription.add(this.collectionClient.focusNote$.subscribe((noteId: string) => this.focusNote(noteId)));
        this.subscription.add(this.collectionClient.noteZoomPercentageChanged$.subscribe(() => this.setEditorZoomPercentage()));
        this.subscription.add(
            this.collectionClient.noteMarkChanged$.subscribe((result: NoteMarkResult) =>
                this.noteMarkChanged(result.noteId, result.isMarked)
            )
        );
    }

    private addDocumentListeners(): void {
        document.onpaste = (e: ClipboardEvent) => {
            if (this.clipboard.containsImage()) {
                // Clipboard contains image. Cancel default paste (it pastes the path to the image instead of the image data).
                e.preventDefault();

                // Execute our own paste, which pastes the image data.
                this.pasteImageFromClipboard();
            }
        };

        document.addEventListener('wheel', (e: WheelEvent) => {
            if (e.ctrlKey) {
                this.setEditorZoomPercentByMouseScroll(e.deltaY);
            }
        });
    }

    private performUndo(): void {
        if (this.quill != undefined && this.quill.history != undefined) {
            try {
                this.quill.history.undo();
            } catch (error) {
                this.logger.error(`Could not perform undo. Cause: ${error}`, 'NoteComponent', 'performUndo');
            }
        }
    }

    private performRedo(): void {
        if (this.quill != undefined && this.quill.history != undefined) {
            try {
                this.quill.history.redo();
            } catch (error) {
                this.logger.error(`Could not perform redo. Cause: ${error}`, 'NoteComponent', 'performRedo');
            }
        }
    }

    public onNoteTitleChange(newNoteTitle: string): void {
        this.isTitleDirty = true;
        this.clearSearch();
        this.noteTitleChanged.next(newNoteTitle);
    }

    public onNoteTextChange(): void {
        this.isTextDirty = true;
        this.clearSearch();
        this.noteTextChanged.next();
    }

    // ngOnDestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    public beforeunloadHandler(event: any): void {
        this.logger.info(`Detected closing of note with id=${this.noteId}`, 'NoteComponent', 'beforeunloadHandler');

        if (this.isTitleDirty || this.isTextDirty) {
            this.isTitleDirty = false;
            this.isTextDirty = false;

            this.logger.info(
                `Note with id=${this.noteId} is dirty. Preventing close to save changes first.`,
                'NoteComponent',
                'beforeunloadHandler'
            );

            event.preventDefault();
            event.returnValue = '';

            this.saveChangesAndCloseNoteWindow.next();
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
        this.collectionClient.setNoteMark(this.noteId, !this.isMarked);
    }

    public async exportNoteToPdfAsync(): Promise<void> {
        this.hideActionButtons();

        const options: SaveDialogOptions = { defaultPath: Utils.getPdfExportPath(remote.app.getPath('documents'), this.noteTitle) };
        const saveDialogReturnValue: SaveDialogReturnValue = await remote.dialog.showSaveDialog(undefined, options);

        if (saveDialogReturnValue.filePath != undefined) {
            this.print.exportToPdfAsync(saveDialogReturnValue.filePath, this.noteTitle, this.quill.root.innerHTML);
        }
    }

    public async printNoteAsync(): Promise<void> {
        this.hideActionButtons();
        this.print.printAsync(this.noteTitle, this.quill.root.innerHTML);
    }

    public async deleteNoteAsync(): Promise<void> {
        this.hideActionButtons();

        const title: string = await this.translator.getAsync('DialogTitles.ConfirmDeleteNote');
        const text: string = await this.translator.getAsync('DialogTexts.ConfirmDeleteNote', { noteTitle: this.noteTitle });

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: { dialogTitle: title, dialogText: text },
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                this.collectionClient.deleteNote(this.noteId);
                this.noteWindow.close();
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
        const saveDialogReturnValue: SaveDialogReturnValue = await remote.dialog.showSaveDialog(undefined, options);

        try {
            if (saveDialogReturnValue.filePath != undefined && saveDialogReturnValue.filePath.length > 0) {
                await this.persistance.exportNoteAsync(
                    saveDialogReturnValue.filePath,
                    this.noteTitle,
                    this.quill.getText(),
                    this.getNoteJsonContent()
                );
                this.snackBar.noteExportedAsync(this.noteTitle);
            }

            this.isBusy = false;
        } catch (error) {
            this.isBusy = false;
            this.logger.error(
                `An error occurred while exporting the note with title '${this.noteTitle}'. Cause: ${error}`,
                'NoteComponent',
                'exportNoteAsync'
            );

            const errorText: string = await this.translator.getAsync('ErrorTexts.ExportNoteError', { noteTitle: this.noteTitle });

            this.dialog.open(ErrorDialogComponent, {
                width: '450px',
                data: { errorText: errorText },
            });
        }
    }

    private async requestSecretKeyAsync(): Promise<boolean> {
        const titleText: string = await this.translator.getAsync('DialogTitles.NoteIsEncrypted');
        const placeholderText: string = await this.translator.getAsync('Input.SecretKey');

        const data: any = { titleText: titleText, inputText: '', placeholderText: placeholderText };

        const dialogRef: MatDialogRef<PasswordInputDialogComponent> = this.dialog.open(PasswordInputDialogComponent, {
            width: '450px',
            data: data,
        });

        const result: any = await dialogRef.afterClosed().toPromise();

        if (result) {
            this.secretKey = data.inputText;

            return true;
        }

        return false;
    }

    public async encryptNoteAsync(): Promise<void> {
        this.hideActionButtons();

        const titleText: string = await this.translator.getAsync('DialogTitles.EncryptNote');
        const placeholderText: string = await this.translator.getAsync('Input.SecretKey');

        const data: any = { titleText: titleText, inputText: '', placeholderText: placeholderText };

        const dialogRef: MatDialogRef<PasswordInputDialogComponent> = this.dialog.open(PasswordInputDialogComponent, {
            width: '450px',
            data: data,
        });

        dialogRef.afterClosed().subscribe(async (result: any) => {
            if (result) {
                this.isEncrypted = true;
                this.secretKey = data.inputText;
                this.collectionClient.encryptNote(this.noteId, this.secretKey);
                await this.setNoteTextAsync();
            }
        });
    }

    public async decryptNoteAsync(): Promise<void> {
        this.hideActionButtons();

        const title: string = await this.translator.getAsync('DialogTitles.ConfirmDecryptNote');
        const text: string = await this.translator.getAsync('DialogTexts.ConfirmDecryptNote');

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: { dialogTitle: title, dialogText: text },
        });

        dialogRef.afterClosed().subscribe(async (result: any) => {
            if (result) {
                this.isEncrypted = false;
                this.secretKey = '';
                this.collectionClient.decryptNote(this.noteId);
                await this.setNoteTextAsync();
            }
        });
    }

    private hasSelectedRange(): boolean {
        const range: any = this.quill.getSelection();

        if (range && range.length > 0) {
            return true;
        }

        return false;
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

    private removeSubscriptions(): void {
        this.subscription.unsubscribe();
    }

    private cleanup(): void {
        this.collectionClient.setNoteOpen(this.noteId, false);
        this.removeSubscriptions();
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

    private async saveAndCloseAsync(): Promise<void> {
        const setNoteTitleOperation: Operation = await this.setNoteTitleAsync(this.noteTitle);
        const setNoteTextOperation: Operation = await this.setNoteTextAsync();

        // Close is only allowed when saving both title and text is successful
        if (setNoteTitleOperation === Operation.Success && setNoteTextOperation === Operation.Success) {
            this.logger.info(`Closing note with id=${this.noteId} after saving changes.`, 'NoteComponent', 'saveAndCloseAsync');
            this.close();
        }
    }

    private close(): void {
        this.cleanup();
        this.noteWindow.close();
    }

    private setEditorZoomPercentage(): void {
        const pFontSize: number = (13 * this.settings.noteZoomPercentage) / 100;
        const h1FontSize: number = pFontSize * 1.7;
        const h2FontSize: number = pFontSize * 1.5;

        const element: HTMLElement = document.documentElement;

        element.style.setProperty('--editor-p-font-size', pFontSize + 'px');
        element.style.setProperty('--editor-h1-font-size', h1FontSize + 'px');
        element.style.setProperty('--editor-h2-font-size', h2FontSize + 'px');
    }

    private setEditorZoomPercentByMouseScroll(mouseWheelDeltaY: number): void {
        const availableNoteZoomPercentages: number[] = Constants.noteZoomPercentages;
        const currentNoteZoomPercentage: number = this.settings.noteZoomPercentage;
        const minimumNoteZoomPercentage: number = Math.min(...availableNoteZoomPercentages);
        const maximumNoteZoomPercentage: number = Math.max(...availableNoteZoomPercentages);

        if (mouseWheelDeltaY < 0) {
            // scrolling up
            if (currentNoteZoomPercentage < maximumNoteZoomPercentage) {
                this.settings.noteZoomPercentage += 10;
            }
        } else {
            // scrolling down
            if (currentNoteZoomPercentage > minimumNoteZoomPercentage) {
                this.settings.noteZoomPercentage -= 10;
            }
        }

        this.collectionClient.onNoteZoomPercentageChanged();

        this.setEditorZoomPercentage();
    }

    private setWindowTitle(noteTitle: string): void {
        this.noteWindow.setTitle(`${ProductInformation.applicationName} - ${noteTitle}`);
    }

    private noteMarkChanged(noteId: string, isMarked: boolean): void {
        if (this.noteId === noteId) {
            this.zone.run(() => (this.isMarked = isMarked));
        }
    }

    private focusNote(noteId: string): void {
        if (this.noteId === noteId) {
            if (this.noteWindow.isMinimized()) {
                this.noteWindow.minimize(); // Workaround for notes not getting restored on Linux
                this.noteWindow.restore();
            }

            this.noteWindow.focus();
        }
    }

    private closeNoteIfMatching(noteId: string): void {
        if (this.noteId === noteId) {
            this.noteWindow.close();
        }
    }

    private closeNote(): void {
        this.noteWindow.close();
    }

    public clearSearch(): void {
        this.noteWindow.webContents.stopFindInPage('keepSelection');
    }

    private async applySearchAsync(): Promise<void> {
        const searchText: string = await this.searchClient.getSearchTextAsync();

        if (searchText && searchText.length > 0) {
            const searchTextPieces: string[] = searchText.trim().split(' ');

            // For now, we can only search for 1 word.
            this.noteWindow.webContents.findInPage(searchTextPieces[0]);
        }
    }

    private async setNoteTitleAsync(finalNoteTitle: string): Promise<Operation> {
        const result: NoteOperationResult = await this.collectionClient.setNoteTitleAsync(
            this.noteId,
            this.initialNoteTitle,
            finalNoteTitle
        );

        if (result.operation === Operation.Blank) {
            this.zone.run(() => (this.noteTitle = this.initialNoteTitle));
            this.snackBar.noteTitleCannotBeEmptyAsync();
        } else if (result.operation === Operation.Error) {
            this.zone.run(() => (this.noteTitle = this.initialNoteTitle));
            const errorText: string = await this.translator.getAsync('ErrorTexts.RenameNoteError', { noteTitle: this.initialNoteTitle });

            this.zone.run(() => {
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px',
                    data: { errorText: errorText },
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

        return result.operation;
    }

    private async setNoteTextAsync(): Promise<Operation> {
        const operation: Operation = await this.collectionClient.setNoteTextAsync(
            this.noteId,
            this.quill.getText(),
            this.isEncrypted,
            this.secretKey,
            this.getTasksCount()
        );

        let showErrorDialog = false;

        if (operation === Operation.Success) {
            try {
                this.persistance.updateNoteContent(this.noteId, this.getNoteJsonContent(), this.isEncrypted, this.secretKey);
            } catch (error) {
                this.logger.error(
                    `Could not save content for the note with id='${this.noteId}'. Cause: ${error}`,
                    'NoteComponent',
                    'setNoteTextCallbackAsync'
                );
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
                    width: '450px',
                    data: { errorText: errorText },
                });
            });
        }

        this.isTextDirty = false;

        return operation;
    }

    private isSecretKeyCorrect(): boolean {
        return this.cryptography.createHash(this.secretKey) === this.secretKeyHash;
    }

    private async getNoteDetailsAsync(): Promise<void> {
        const result: NoteDetailsResult = await this.collectionClient.getNoteDetailsAsync(this.noteId);

        this.initialNoteTitle = result.noteTitle;
        this.noteTitle = result.noteTitle;
        this.isMarked = result.isMarked;
        this.isEncrypted = result.isEncrypted;
        this.secretKeyHash = result.secretKeyHash;

        this.setWindowTitle(result.noteTitle);
    }

    private async getNoteContentAsync(): Promise<void> {
        try {
            const noteContent: string = await this.persistance.getNoteContentAsync(this.noteId, this.isEncrypted, this.secretKey);

            if (noteContent) {
                // We can only parse to json if there is content
                this.logger.info(`Setting the content for the note with id='${this.noteId}'`, 'NoteComponent', 'getNoteDetailsAsync');
                this.quill.setContents(JSON.parse(noteContent), 'silent');
                this.quill.history.clear();
            } else {
                this.logger.error(
                    `Could not get the content for the note with id='${this.noteId}'`,
                    'NoteComponent',
                    'getNoteDetailsAsync'
                );
            }
        } catch (error) {
            this.logger.error(
                `Could not get the content for the note with id='${this.noteId}'. Cause: ${error}`,
                'NoteComponent',
                'getNoteDetailsAsync'
            );

            const errorText: string = await this.translator.getAsync('ErrorTexts.GetNoteContentError');

            this.dialog.open(ErrorDialogComponent, {
                width: '450px',
                data: { errorText: errorText },
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
        const noteContent: string = this.getNoteJsonContent();
        const openTasksCount: number = (noteContent.match(/"list":"unchecked"/g) || []).length;
        const closedTasksCount: number = (noteContent.match(/"list":"checked"/g) || []).length;

        return new TasksCount(openTasksCount, closedTasksCount);
    }

    private getNoteJsonContent(): string {
        return JSON.stringify(this.quill.getContents());
    }

    private async requestSecretKeyOrCloseNoteAsync(): Promise<void> {
        if (!this.isEncrypted) {
            return;
        }

        let isClosing: boolean = false;

        while (!this.isSecretKeyCorrect() && !isClosing) {
            if (!(await this.requestSecretKeyAsync())) {
                isClosing = true;
                this.noteWindow.close();
            } else {
                if (!this.isSecretKeyCorrect()) {
                    const notificationTitle: string = await this.translator.getAsync('NotificationTitles.IncorrectKey');
                    const notificationText: string = await this.translator.getAsync('NotificationTexts.SecretKeyIncorrect');
                    const dialogRef: MatDialogRef<NotificationDialogComponent> = this.dialog.open(NotificationDialogComponent, {
                        width: '450px',
                        data: { notificationTitle: notificationTitle, notificationText: notificationText },
                    });

                    await dialogRef.afterClosed().toPromise();
                }
            }
        }
    }

    private async configureQuillEditorAsync(): Promise<void> {
        this.quill = await this.quillFactory.createAsync('#editor', this.performUndo.bind(this), this.performRedo.bind(this));
        await this.quillTweaker.setToolbarTooltipsAsync();
        this.quillTweaker.forcePasteOfUnformattedText(this.quill);
        this.quillTweaker.assignActionToControlKeyCombination(this.quill, 'Y', this.performRedo.bind(this));
        this.quillTweaker.assignActionToTextChange(this.quill, this.onNoteTextChange.bind(this));
    }
}
