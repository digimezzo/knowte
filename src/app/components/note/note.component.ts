import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import * as remote from '@electron/remote';
import { BrowserWindow } from 'electron';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators';
import { BaseSettings } from '../../core/base-settings';
import { ClipboardManager } from '../../core/clipboard-manager';
import { Constants } from '../../core/constants';
import { Operation } from '../../core/enums';
import { Logger } from '../../core/logger';
import { ProductInformation } from '../../core/product-information';
import { Strings } from '../../core/strings';
import { Utils } from '../../core/utils';
import { BaseAppearanceService } from '../../services/appearance/base-appearance.service';
import { CollectionClient } from '../../services/collection/collection.client';
import { CryptographyService } from '../../services/cryptography/cryptography.service';
import { PersistanceService } from '../../services/persistance/persistance.service';
import { NoteDetailsResult } from '../../services/results/note-details-result';
import { NoteMarkResult } from '../../services/results/note-mark-result';
import { NoteOperationResult } from '../../services/results/note-operation-result';
import { NotePinResult } from '../../services/results/note-pin-result';
import { SearchClient } from '../../services/search/search.client';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { SpellCheckService } from '../../services/spell-check/spell-check.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
import { NotificationDialogComponent } from '../dialogs/notification-dialog/notification-dialog.component';
import { PasswordInputDialogComponent } from '../dialogs/password-input-dialog/password-input-dialog.component';
import { SearchBottomSheetComponent } from './bottom-sheets/search-bottom-sheet/search-bottom-sheet.component';
import { ShareBottomSheetComponent } from './bottom-sheets/share-bottom-sheet/share-bottom-sheet.component';
import { ContextMenuItemsEnabledState } from './context-menu-items-enabled-state';
import { NoteContextMenuFactory } from './note-context-menu-factory';
import { INoteEditor } from './note-editor/i-note-editor';
import { NoteEditorFactory } from './note-editor/note-editor-factory';

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
    private subscription: Subscription = new Subscription();

    private isTitleDirty: boolean = false;
    private isTextDirty: boolean = false;

    private secretKey: string = '';
    private secretKeyHash: string = '';

    private noteWindow: BrowserWindow;

    constructor(
        private activatedRoute: ActivatedRoute,
        private zone: NgZone,
        private dialog: MatDialog,
        private logger: Logger,
        private snackBar: SnackBarService,
        private translator: TranslatorService,
        private cryptography: CryptographyService,
        private persistance: PersistanceService,
        public settings: BaseSettings,
        public appearance: BaseAppearanceService,
        public spellCheckService: SpellCheckService,
        private clipboard: ClipboardManager,
        private noteContextMenuFactory: NoteContextMenuFactory,
        private collectionClient: CollectionClient,
        private searchClient: SearchClient,
        private bottomSheet: MatBottomSheet,
        private noteEditorFactory: NoteEditorFactory
    ) {}

    public isEncrypted: boolean = false;
    public isMarkdownNote: boolean = false;
    public noteId: string;
    public initialNoteTitle: string;
    public noteTitle: string;
    public isMarked: boolean;
    public isPinned: boolean;
    public isTrashed: boolean;
    public noteTitleChanged: Subject<string> = new Subject<string>();
    public noteContentChanged: Subject<void> = new Subject<void>();
    public saveChangesAndCloseNoteWindow: Subject<void> = new Subject<void>();
    public canPerformActions: boolean = false;
    public isBusy: boolean = false;
    public actionIconRotation: string = 'default';
    public canSearch: boolean = false;
    private searchText: string = '';
    private noteEditor: INoteEditor;

    public async ngOnInit(): Promise<void> {
        this.activatedRoute.queryParams.subscribe(async (params) => {
            this.noteId = params['id'];
            this.noteWindow = remote.getCurrentWindow();
            await this.getNoteDetailsAsync();

            this.noteEditor = this.noteEditorFactory.create(this.noteId, this.isMarkdownNote);
            await this.noteEditor.initializeAsync();

            await this.requestSecretKeyOrCloseNoteAsync();
            this.addSubscriptions();
            this.addDocumentListeners();

            await this.getNoteContentAsync();
            this.searchText = await this.searchClient.getSearchTextAsync();
            this.applySearch();

            this.noteWindow.webContents.on('context-menu', (event, contextMenuParams) => {
                const hasSelectedText: boolean = this.noteEditor.hasSelectedText();
                const contextMenuItemsEnabledState: ContextMenuItemsEnabledState = new ContextMenuItemsEnabledState(
                    hasSelectedText,
                    this.clipboard.containsText() || this.clipboard.containsImage()
                );
                this.noteContextMenuFactory.createAsync(
                    this.noteWindow.webContents,
                    contextMenuParams,
                    contextMenuItemsEnabledState,
                    () => this.noteEditor.performCut(),
                    () => this.noteEditor.performCopy(),
                    () => this.noteEditor.performPaste(),
                    () => this.noteEditor.performDelete()
                );
            });
        });
    }

    @HostListener('document:keydown.escape')
    private handleEscape(): void {
        if (this.settings.closeNotesWithEscape) {
            this.noteWindow.close();
        }
    }

    private addSubscriptions(): void {
        this.noteTitleChanged.pipe(debounceTime(Constants.noteSaveTimeoutMilliseconds)).subscribe(async (finalNoteTitle) => {
            await this.saveNoteTitleAsync(finalNoteTitle);
        });

        this.noteContentChanged.pipe(debounceTime(Constants.noteSaveTimeoutMilliseconds)).subscribe(async () => {
            await this.saveNoteContentAsync();
        });

        this.saveChangesAndCloseNoteWindow.pipe(debounceTime(Constants.noteWindowCloseTimeoutMilliseconds)).subscribe(async () => {
            await this.saveAndCloseAsync();
        });

        this.subscription.add(
            this.searchClient.searchTextChanged$.subscribe((searchText: string) => {
                this.searchText = searchText;
                this.applySearch();
            })
        );
        this.subscription.add(this.collectionClient.closeNote$.subscribe((noteId: string) => this.closeNoteIfMatching(noteId)));
        this.subscription.add(this.collectionClient.closeAllNotes$.subscribe(() => this.closeNote()));
        this.subscription.add(this.collectionClient.focusNote$.subscribe((noteId: string) => this.focusNote(noteId)));
        this.subscription.add(
            this.collectionClient.noteZoomPercentageChanged$.subscribe(() => this.noteEditor.applyZoomPercentageFromSettings())
        );
        this.subscription.add(
            this.collectionClient.noteMarkChanged$.subscribe((result: NoteMarkResult) =>
                this.noteMarkChanged(result.noteId, result.isMarked)
            )
        );
        this.subscription.add(
            this.collectionClient.notePinChanged$.subscribe((result: NotePinResult) => this.notePinChanged(result.noteId, result.isPinned))
        );
        this.subscription.add(this.noteEditor.noteContentChanged$.subscribe(() => this.onNoteContentChange()));
    }

    private addDocumentListeners(): void {
        document.onpaste = (e: ClipboardEvent) => {
            if (this.clipboard.containsImage()) {
                // Clipboard contains image. Cancel default paste (it pastes the path to the image instead of the image data).
                e.preventDefault();

                // Execute our own paste, which pastes the image data.
                this.noteEditor.pasteImageFromClipboard();
            }
        };

        document.addEventListener('wheel', (e: WheelEvent) => {
            if (e.ctrlKey) {
                this.setEditorZoomPercentByMouseScroll(e.deltaY);
            }
        });
    }

    public onNoteTitleChange(newNoteTitle: string): void {
        this.isTitleDirty = true;
        this.clearSearch();
        this.noteTitleChanged.next(newNoteTitle);
    }

    private onNoteContentChange(): void {
        this.isTextDirty = true;
        this.clearSearch();
        this.noteContentChanged.next();
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

            // If this is a markdown note, make sure we're in edit mode.
            if (this.isMarkdownNote) {
                this.noteEditor.isEditing = true;
            }

            // Sets focus to editor when pressing enter on title
            this.noteEditor.focus();
        }
    }

    public toggleNoteMark(): void {
        this.hideActionButtonsDelayedAsync();
        this.collectionClient.setNoteMark(this.noteId, !this.isMarked);
    }

    public toggleNotePin(): void {
        this.hideActionButtonsDelayedAsync();
        this.collectionClient.setNotePin(this.noteId, !this.isPinned);
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

    private async requestSecretKeyAsync(): Promise<boolean> {
        const titleText: string = await this.translator.getAsync('DialogTitles.NoteIsEncrypted');
        const placeholderText: string = await this.translator.getAsync('Input.SecretKey');

        const data: any = {
            titleText: titleText,
            inputText: '',
            placeholderText: placeholderText,
            confirmationPlaceholderText: '',
            confirmationErrorText: '',
            requiresConfirmation: false,
        };

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
        const confirmationPlaceholderText: string = await this.translator.getAsync('Input.ConfirmSecretKey');
        const confirmationErrorText: string = await this.translator.getAsync('Input.SecretKeysDoNotMatch');

        const data: any = {
            titleText: titleText,
            inputText: '',
            placeholderText: placeholderText,
            confirmationPlaceholderText: confirmationPlaceholderText,
            confirmationErrorText: confirmationErrorText,
            requiresConfirmation: true,
        };

        const dialogRef: MatDialogRef<PasswordInputDialogComponent> = this.dialog.open(PasswordInputDialogComponent, {
            width: '450px',
            data: data,
        });

        dialogRef.afterClosed().subscribe(async (result: any) => {
            if (result) {
                this.isEncrypted = true;
                this.secretKey = data.inputText;
                this.collectionClient.encryptNote(this.noteId, this.secretKey);
                await this.saveNoteContentAsync();
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
                await this.saveNoteContentAsync();
            }
        });
    }

    private removeSubscriptions(): void {
        this.subscription.unsubscribe();
    }

    private cleanup(): void {
        this.collectionClient.setNoteOpen(this.noteId, false);
        this.removeSubscriptions();
    }

    private async saveAndCloseAsync(): Promise<void> {
        const setNoteTitleOperation: Operation = await this.saveNoteTitleAsync(this.noteTitle);
        const setNoteTextOperation: Operation = await this.saveNoteContentAsync();

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

        this.noteEditor.applyZoomPercentageFromSettings();
    }

    private setWindowTitle(noteTitle: string): void {
        this.noteWindow.setTitle(`${ProductInformation.applicationName} - ${noteTitle}`);
    }

    private noteMarkChanged(noteId: string, isMarked: boolean): void {
        if (this.noteId === noteId) {
            this.zone.run(() => (this.isMarked = isMarked));
        }
    }

    private notePinChanged(noteId: string, isPinned: boolean): void {
        if (this.noteId === noteId) {
            this.zone.run(() => (this.isPinned = isPinned));
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

    private applySearch(): void {
        if (!Strings.isNullOrWhiteSpace(this.searchText)) {
            const searchTextPieces: string[] = this.searchText.trim().split(' ');

            // For now, we can only search for 1 word.
            setTimeout(() => {
                this.noteWindow.webContents.findInPage(searchTextPieces[0]);
            }, 0);
        } else {
            this.clearSearch();
        }
    }

    private async saveNoteTitleAsync(finalNoteTitle: string): Promise<Operation> {
        const result: NoteOperationResult = await this.collectionClient.saveNoteTitleAsync(
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

    private async saveNoteContentAsync(): Promise<Operation> {
        const operation: Operation = await this.collectionClient.saveNoteTextAsync(
            this.noteId,
            this.noteEditor.text,
            this.isEncrypted,
            this.secretKey,
            this.noteEditor.getTasksCount()
        );

        let showErrorDialog = false;

        if (operation === Operation.Success) {
            try {
                await this.persistance.updateNoteContentAsync(
                    this.noteId,
                    this.noteEditor.content,
                    this.isEncrypted,
                    this.secretKey,
                    this.isMarkdownNote
                );
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
        this.isPinned = result.isPinned;
        this.isTrashed = result.isTrashed;
        this.isEncrypted = result.isEncrypted;
        this.secretKeyHash = result.secretKeyHash;
        this.isMarkdownNote = result.isMarkdownNote;

        this.setWindowTitle(result.noteTitle);
    }

    private async getNoteContentAsync(): Promise<void> {
        try {
            const noteContent: string = await this.persistance.getNoteContentAsync(
                this.noteId,
                this.isEncrypted,
                this.secretKey,
                this.isMarkdownNote
            );

            if (noteContent) {
                // We can only parse to json if there is content
                this.logger.info(`Setting the content for the note with id='${this.noteId}'`, 'NoteComponent', 'getNoteContentAsync');
                this.noteEditor.content = noteContent;
            } else {
                this.logger.error(
                    `Could not get the content for the note with id='${this.noteId}'`,
                    'NoteComponent',
                    'getNoteContentAsync'
                );
            }
        } catch (error) {
            this.logger.error(
                `Could not get the content for the note with id='${this.noteId}'. Cause: ${error}`,
                'NoteComponent',
                'getNoteContentAsync'
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
        this.noteEditor.applyHeading(1);
    }

    public heading2(event: any): void {
        this.noteEditor.applyHeading(2);
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

    @HostListener('document:keydown.control.f')
    public openSearchBottomSheet(): void {
        this.hideActionButtonsDelayedAsync();

        const config: MatBottomSheetConfig = {
            data: { searchText: this.searchText },
        };

        this.bottomSheet.open(SearchBottomSheetComponent, config);
    }

    @HostListener('document:keydown.control.b')
    public applyBold(): void {
        this.noteEditor.applyBold();
    }

    @HostListener('document:keydown.control.i')
    public applyItalic(): void {
        this.noteEditor.applyItalic();
    }

    @HostListener('document:keydown.control.s')
    public applyStrikeThrough(): void {
        this.noteEditor.applyStrikeThrough();
    }

    @HostListener('document:keydown.control.1')
    public applyHeading1(): void {
        this.noteEditor.applyHeading(1);
    }

    @HostListener('document:keydown.control.2')
    public applyHeading2(): void {
        this.noteEditor.applyHeading(2);
    }

    @HostListener('document:keydown.control.3')
    public applyHeading3(): void {
        this.noteEditor.applyHeading(3);
    }

    @HostListener('document:keydown.control.k')
    public insertLink(): void {
        this.noteEditor.insertLink();
    }

    @HostListener('document:keydown.control.q')
    public applyQuote(): void {
        this.noteEditor.applyQuote();
    }

    @HostListener('document:keydown.control.m')
    public applyCode(): void {
        this.noteEditor.applyCode();
    }

    public openShareBottomSheet(): void {
        this.hideActionButtonsDelayedAsync();

        const config: MatBottomSheetConfig = {
            data: {
                noteId: this.noteId,
                noteTitle: this.noteTitle,
                noteText: this.noteEditor.text,
                noteContent: this.noteEditor.content,
                noteHtml: this.noteEditor.html,
                isMarkdownNote: this.isMarkdownNote,
            },
        };

        this.bottomSheet.open(ShareBottomSheetComponent, config);
    }

    public strikeThrough(event: any): void {
        this.noteEditor.applyStrikeThrough();
    }
}
