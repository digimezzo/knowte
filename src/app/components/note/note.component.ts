import { Component, HostListener, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import * as remote from '@electron/remote';
import { BrowserWindow } from 'electron';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators';
import { Constants } from '../../common/application/constants';
import { ProductInformation } from '../../common/application/product-information';
import { Operation } from '../../common/enums/operation';
import { ClipboardManager } from '../../common/io/clipboard-manager';
import { Logger } from '../../common/logging/logger';
import { BaseSettings } from '../../common/settings/base-settings';
import { StringUtils } from '../../common/utils/strings-utils';
import { TagUtils } from '../../common/utils/tag-utils';
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
import { InputDialogComponent } from '../dialogs/input-dialog/input-dialog.component';
import { NotificationDialogComponent } from '../dialogs/notification-dialog/notification-dialog.component';
import { PasswordInputDialogComponent } from '../dialogs/password-input-dialog/password-input-dialog.component';
import { SearchBottomSheetComponent } from './bottom-sheets/search-bottom-sheet/search-bottom-sheet.component';
import { ActionsBottomSheetComponent, NoteAction, NoteActionsData } from './bottom-sheets/actions-bottom-sheet/actions-bottom-sheet.component';
import { ShareBottomSheetComponent } from './bottom-sheets/share-bottom-sheet/share-bottom-sheet.component';
import { ContextMenuItemsEnabledState } from './context-menu-items-enabled-state';
import { NoteContextMenuFactory } from './note-context-menu-factory';
import { INoteEditor } from './note-editor/i-note-editor';
import { NoteEditorFactory } from './note-editor/note-editor-factory';
import { NoteSearch } from './note-search';

@Component({
    selector: 'app-note',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NoteComponent implements OnInit {
    private subscription: Subscription = new Subscription();

    private isTitleDirty: boolean = false;
    private isTextDirty: boolean = false;
    private contentRevision: number = 0;
    private pendingContentSave: Promise<Operation>;
    private hasLoadedNoteContent: boolean = false;
    private isEditingTags: boolean = false;

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
        private noteEditorFactory: NoteEditorFactory,
    ) {}

    public isEncrypted: boolean = false;
    public isMarkdownNote: boolean = false;
    public noteId: string;
    public initialNoteTitle: string;
    public noteTitle: string;
    public tags: string[] = [];
    public isMarked: boolean;
    public isPinned: boolean;
    public isTrashed: boolean;
    public noteTitleChanged: Subject<string> = new Subject<string>();
    public noteContentChanged: Subject<void> = new Subject<void>();
    public saveChangesAndCloseNoteWindow: Subject<void> = new Subject<void>();
    public isActionsSheetOpen: boolean = false;
    public isBusy: boolean = false;
    public canSearch: boolean = false;
    public noteAttachmentsDirectoryPathForPreview: string = '';
    private searchText: string = '';
    private searchTimeout?: ReturnType<typeof setTimeout>;
    private noteSearch = new NoteSearch();
    public noteEditor: INoteEditor;

    public async ngOnInit(): Promise<void> {
        this.activatedRoute.queryParams.subscribe(async (params) => {
            this.noteId = params['id'];
            this.noteWindow = remote.getCurrentWindow();
            await this.getNoteDetailsAsync();

            this.noteEditor = this.noteEditorFactory.create(this.noteId, this.isMarkdownNote);
            await this.noteEditor.initializeAsync();

            await this.requestSecretKeyOrCloseNoteAsync();
            await this.refreshMarkdownAttachmentPreviewDirectoryAsync();
            this.addSubscriptions();
            this.addDocumentListeners();

            await this.getNoteContentAsync();
            this.searchText = await this.searchClient.getSearchTextAsync();
            this.applySearch();

            this.noteWindow.webContents.on('context-menu', (event, contextMenuParams) => {
                const hasSelectedText: boolean = this.noteEditor.hasSelectedText();
                const contextMenuItemsEnabledState: ContextMenuItemsEnabledState = new ContextMenuItemsEnabledState(
                    hasSelectedText,
                    this.clipboard.containsText() || this.clipboard.containsImage(),
                );
                this.noteContextMenuFactory.createAsync(
                    this.noteWindow.webContents,
                    contextMenuParams,
                    contextMenuItemsEnabledState,
                    () => this.noteEditor.performCut(),
                    () => this.noteEditor.performCopy(),
                    () => this.noteEditor.performPaste(),
                    () => this.noteEditor.performDelete(),
                );
            });
        });
    }

    @HostListener('document:keydown.escape')
    private handleEscape(): void {
        if (this.settings.closeNotesWithEscape && !this.isEditingTags && !this.isActionsSheetOpen) {
            this.noteWindow.close();
        }
    }

    private addSubscriptions(): void {
        this.subscription.add(
            this.collectionClient.prepareNoteBackup$.subscribe(async ({ noteId, callback }) => {
                if (this.noteId !== noteId) {
                    return;
                }
                try {
                    if (this.isBusy || this.isEditingTags || !this.hasLoadedNoteContent) {
                        throw Object.assign(new Error('The note is not ready for backup.'), { code: 'BACKUP_POSTPONED' });
                    }
                    if (this.isTitleDirty) {
                        throw Object.assign(new Error('A note title is still being edited. Retry after it has been saved.'),
                            { code: 'BACKUP_POSTPONED' });
                    }
                    if ((this.isTextDirty || this.pendingContentSave) &&
                        await this.saveNoteContentAsync(false) !== Operation.Success) {
                        throw new Error('Could not save note content for backup.');
                    }
                    if (this.isTextDirty || this.isTitleDirty) {
                        throw Object.assign(new Error('The note changed while saving for backup.'), { code: 'BACKUP_POSTPONED' });
                    }
                    callback(JSON.stringify({ revision: this.contentRevision, title: this.noteTitle }));
                } catch (error) {
                    this.logger.warn(`Could not prepare note for backup: ${error.message}`, 'NoteComponent', 'prepareNoteBackup');
                    callback(JSON.stringify({ error: error.message, code: error.code }));
                }
            }),
        );
        this.subscription.add(
            this.noteTitleChanged.pipe(debounceTime(Constants.noteSaveTimeoutMilliseconds)).subscribe(async (finalNoteTitle) => {
                await this.saveNoteTitleAsync(finalNoteTitle);
            }),
        );

        this.subscription.add(
            this.noteContentChanged.pipe(debounceTime(Constants.noteSaveTimeoutMilliseconds)).subscribe(async () => {
                await this.saveNoteContentAsync();
            }),
        );

        this.subscription.add(
            this.saveChangesAndCloseNoteWindow.pipe(debounceTime(Constants.noteWindowCloseTimeoutMilliseconds)).subscribe(async () => {
                await this.saveAndCloseAsync();
            }),
        );

        this.subscription.add(
            this.searchClient.searchTextChanged$.subscribe((searchText: string) => {
                this.searchText = searchText;
                this.applySearch();
            }),
        );
        this.subscription.add(this.collectionClient.closeNote$.subscribe((noteId: string) => this.closeNoteIfMatching(noteId)));
        this.subscription.add(
            this.collectionClient.prepareNoteDeletion$.subscribe(async ({ noteId, callback }) => {
                if (this.noteId !== noteId) {
                    return;
                }

                if (!this.hasLoadedNoteContent || this.isBusy) {
                    this.logger.warn('Note is not ready for deletion.', 'NoteComponent', 'prepareNoteDeletion');
                    callback(Operation.Error);
                    return;
                }

                this.zone.run(() => (this.isBusy = true));
                if (this.isTitleDirty && (await this.saveNoteTitleAsync(this.noteTitle)) !== Operation.Success) {
                    this.zone.run(() => (this.isBusy = false));
                    callback(Operation.Error);
                    return;
                }

                const operation: Operation = await this.saveNoteContentAsync();
                if (operation === Operation.Success && !this.isTextDirty) {
                    this.cleanup();
                    // Closing can destroy this renderer before it acknowledges the save.
                    callback(operation);
                    this.noteWindow.close();
                } else {
                    this.zone.run(() => (this.isBusy = false));
                    if (operation === Operation.Success) {
                        this.logger.warn('Note changed while preparing deletion.', 'NoteComponent', 'prepareNoteDeletion');
                    }
                    callback(Operation.Error);
                }
            }),
        );
        this.subscription.add(this.collectionClient.closeAllNotes$.subscribe(() => this.closeNote()));
        this.subscription.add(this.collectionClient.focusNote$.subscribe((noteId: string) => this.focusNote(noteId)));
        this.subscription.add(
            this.collectionClient.noteZoomPercentageChanged$.subscribe(() => this.noteEditor.applyZoomPercentageFromSettings()),
        );
        this.subscription.add(
            this.collectionClient.noteMarkChanged$.subscribe((result: NoteMarkResult) =>
                this.noteMarkChanged(result.noteId, result.isMarked),
            ),
        );
        this.subscription.add(
            this.collectionClient.notePinChanged$.subscribe((result: NotePinResult) => this.notePinChanged(result.noteId, result.isPinned)),
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
        this.contentRevision++;
        this.isTextDirty = true;
        this.clearSearch();
        this.noteContentChanged.next();
    }

    // ngOnDestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    public beforeunloadHandler(event: any): void {
        if (this.isEditingTags) {
            event.preventDefault();
            event.returnValue = '';
            return;
        }

        this.logger.info(`Detected closing of note with id=${this.noteId}`, 'NoteComponent', 'beforeunloadHandler');

        if (this.isTitleDirty || this.isTextDirty || this.pendingContentSave) {
            this.logger.info(
                `Note with id=${this.noteId} is dirty. Preventing close to save changes first.`,
                'NoteComponent',
                'beforeunloadHandler',
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
        this.collectionClient.setNoteMark(this.noteId, !this.isMarked);
    }

    public async editTagsAsync(): Promise<void> {
        if (this.isEditingTags || this.isBusy) {
            return;
        }
        this.isEditingTags = true;
        this.isBusy = true;
        try {
            const data = {
                titleText: await this.translator.getAsync('Tags.Edit'),
                placeholderText: await this.translator.getAsync('Tags.Input'),
                descriptionText: await this.translator.getAsync('Tags.Description'),
                inputText: this.tags.join(', '),
                allowEmpty: true,
            };
            const dialogRef = this.dialog.open(InputDialogComponent, { width: '450px', data });
            if (!(await dialogRef.afterClosed().toPromise())) {
                return;
            }
            const tags: string[] = TagUtils.normalize(data.inputText.split(','));
            if (await this.collectionClient.saveNoteTagsAsync(this.noteId, tags) !== Operation.Success) {
                throw new Error('Saving note tags failed.');
            }
            this.zone.run(() => (this.tags = tags));
        } catch (error) {
            this.logger.error(`Could not edit tags for note with id=${this.noteId}. Cause: ${error}`, 'NoteComponent', 'editTagsAsync');
            const errorText: string = await this.translator.getAsync('Tags.SaveError');
            this.zone.run(() => this.dialog.open(ErrorDialogComponent, { width: '450px', data: { errorText } }));
        } finally {
            this.isEditingTags = false;
            this.zone.run(() => (this.isBusy = false));
        }
    }

    public toggleNotePin(): void {
        this.collectionClient.setNotePin(this.noteId, !this.isPinned);
    }

    public async deleteNoteAsync(): Promise<void> {
        const title: string = await this.translator.getAsync('DialogTitles.ConfirmDeleteNote');
        const text: string = await this.translator.getAsync('DialogTexts.ConfirmDeleteNote', { noteTitle: this.noteTitle });

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: { dialogTitle: title, dialogText: text },
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                this.collectionClient.deleteNote(this.noteId);
            }
        });
    }

    public async openActionsBottomSheet(): Promise<void> {
        if (this.isBusy || this.isActionsSheetOpen) {
            return;
        }
        const ariaLabel: string = await this.translator.getAsync('Tooltips.Actions');
        if (this.isBusy || this.isActionsSheetOpen) {
            return;
        }
        this.isActionsSheetOpen = true;
        let action: NoteAction | undefined;
        try {
            const ref = this.bottomSheet.open<ActionsBottomSheetComponent, NoteActionsData, NoteAction>(
                ActionsBottomSheetComponent,
                {
                    ariaLabel,
                    panelClass: 'note-actions-sheet',
                    data: {
                        isPinned: this.isPinned,
                        isMarked: this.isMarked,
                        isEncrypted: this.isEncrypted,
                        isTrashed: this.isTrashed,
                    },
                },
            );
            action = await ref.afterDismissed().toPromise();
        } finally {
            this.isActionsSheetOpen = false;
        }

        switch (action) {
            case 'search': this.openSearchBottomSheet(); break;
            case 'tags': await this.editTagsAsync(); break;
            case 'share': this.openShareBottomSheet(); break;
            case 'pin': this.toggleNotePin(); break;
            case 'mark': this.toggleNoteMark(); break;
            case 'encrypt': await this.encryptNoteAsync(); break;
            case 'decrypt': await this.decryptNoteAsync(); break;
            case 'delete':
                if (!this.isTrashed) {
                    await this.deleteNoteAsync();
                }
                break;
        }
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
        const title: string = await this.translator.getAsync('DialogTitles.ConfirmDecryptNote');
        const text: string = await this.translator.getAsync('DialogTexts.ConfirmDecryptNote');

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: { dialogTitle: title, dialogText: text },
        });

        dialogRef.afterClosed().subscribe(async (result: any) => {
            if (result) {
                this.isEncrypted = false;
                this.collectionClient.decryptNote(this.noteId);
                await this.saveNoteContentAsync();
                this.secretKey = '';
            }
        });
    }

    private removeSubscriptions(): void {
        this.subscription.unsubscribe();
    }

    private cleanup(): void {
        clearTimeout(this.searchTimeout);
        this.noteSearch.clear();
        if (this.isMarkdownNote) {
            this.persistance.clearNoteAttachmentsPreviewDirectory(this.noteId);
        }

        this.collectionClient.setNoteOpen(this.noteId, false);
        this.removeSubscriptions();
        this.collectionClient.dispose();
    }

    private async saveAndCloseAsync(): Promise<void> {
        if (this.isBusy) {
            return;
        }
        this.zone.run(() => (this.isBusy = true));
        const setNoteTitleOperation: Operation = await this.saveNoteTitleAsync(this.noteTitle);
        const setNoteTextOperation: Operation = await this.saveNoteContentAsync();

        // Close is only allowed when saving both title and text is successful
        if (setNoteTitleOperation === Operation.Success && setNoteTextOperation === Operation.Success && !this.isTextDirty) {
            this.logger.info(`Closing note with id=${this.noteId} after saving changes.`, 'NoteComponent', 'saveAndCloseAsync');
            this.close();
        } else {
            this.zone.run(() => (this.isBusy = false));
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
        clearTimeout(this.searchTimeout);
        this.noteSearch.clear();
        this.noteWindow.webContents.stopFindInPage('clearSelection');
    }

    private applySearch(): void {
        clearTimeout(this.searchTimeout);
        const searchText: string = TagUtils.parseSearch(this.searchText).text;
        if (!StringUtils.isNullOrWhiteSpace(searchText)) {
            const searchTextPieces: string[] = searchText.split(/\s+/);

            // For now, we can only search for 1 word.
            this.searchTimeout = setTimeout(() => {
                if (this.noteSearch.find(searchTextPieces[0])) {
                    return;
                }
                const activeElement = document.activeElement;
                if (activeElement instanceof HTMLElement) {
                    activeElement.blur();
                }
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.collapse(document.body, 0);
                this.noteWindow.webContents.findInPage(searchTextPieces[0], { forward: true, findNext: false });
            }, 0);
        } else {
            this.clearSearch();
        }
    }

    private async saveNoteTitleAsync(finalNoteTitle: string): Promise<Operation> {
        const result: NoteOperationResult = await this.collectionClient.saveNoteTitleAsync(
            this.noteId,
            this.initialNoteTitle,
            finalNoteTitle,
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

    private saveNoteContentAsync(notifyOnError: boolean = true): Promise<Operation> {
        const previousSave: Promise<Operation> = this.pendingContentSave;
        let save: Promise<Operation>;
        save = (async () => {
            try {
                if (previousSave) {
                    await previousSave;
                }
                return await this.saveNoteContentNowAsync(notifyOnError);
            } finally {
                if (this.pendingContentSave === save) {
                    this.pendingContentSave = undefined;
                }
            }
        })();
        this.pendingContentSave = save;
        return save;
    }

    private async saveNoteContentNowAsync(notifyOnError: boolean): Promise<Operation> {
        const revision: number = this.contentRevision;
        const content: string = this.noteEditor.content;
        const operation: Operation = await this.collectionClient.saveNoteTextAsync(
            this.noteId,
            this.noteEditor.text,
            this.isEncrypted,
            this.secretKey,
            this.noteEditor.getTasksCount(),
        );

        let showErrorDialog = false;

        if (operation === Operation.Success) {
            try {
                await this.persistance.updateNoteContentAsync(
                    this.noteId,
                    content,
                    this.isEncrypted,
                    this.secretKey,
                    this.isMarkdownNote,
                );

                await this.refreshMarkdownAttachmentPreviewDirectoryAsync();
            } catch (error) {
                this.logger.error(
                    `Could not save content for the note with id='${this.noteId}'. Cause: ${error}`,
                    'NoteComponent',
                    'setNoteTextCallbackAsync',
                );
                showErrorDialog = true;
            }
        } else if (operation === Operation.Error) {
            showErrorDialog = true;
        } else {
            // Do nothing
        }

        if (showErrorDialog) {
            if (notifyOnError) {
                const errorText: string = await this.translator.getAsync('ErrorTexts.UpdateNoteContentError');

                this.zone.run(() => {
                    this.dialog.open(ErrorDialogComponent, {
                        width: '450px',
                        data: { errorText: errorText },
                    });
                });
            }

            return Operation.Error;
        }

        if (this.contentRevision === revision) {
            this.isTextDirty = false;
        }

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
        this.tags = TagUtils.normalize(result.tags);

        this.setWindowTitle(result.noteTitle);
    }

    private async getNoteContentAsync(): Promise<void> {
        try {
            const noteContent: string = await this.persistance.getNoteContentAsync(
                this.noteId,
                this.isEncrypted,
                this.secretKey,
                this.isMarkdownNote,
            );

            this.logger.info(`Setting the content for the note with id='${this.noteId}'`, 'NoteComponent', 'getNoteContentAsync');
            this.noteEditor.content = noteContent;
            this.hasLoadedNoteContent = true;
        } catch (error) {
            this.logger.error(
                `Could not get the content for the note with id='${this.noteId}'. Cause: ${error}`,
                'NoteComponent',
                'getNoteContentAsync',
            );

            const errorText: string = await this.translator.getAsync('ErrorTexts.GetNoteContentError');

            this.dialog.open(ErrorDialogComponent, {
                width: '450px',
                data: { errorText: errorText },
            });
        }
    }

    private async refreshMarkdownAttachmentPreviewDirectoryAsync(): Promise<void> {
        if (!this.isMarkdownNote) {
            return;
        }

        this.noteAttachmentsDirectoryPathForPreview = await this.persistance.getNoteAttachmentsDirectoryPathForPreviewAsync(
            this.noteId,
            this.isEncrypted,
            this.secretKey,
            this.isMarkdownNote,
        );
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
        const config: MatBottomSheetConfig = {
            data: { searchText: TagUtils.parseSearch(this.searchText).text },
        };

        const ref = this.bottomSheet.open<SearchBottomSheetComponent, any, string>(SearchBottomSheetComponent, config);
        this.subscription.add(ref.afterDismissed().subscribe((searchText) => {
            if (searchText !== undefined) {
                this.searchText = searchText;
                this.applySearch();
            }
        }));
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
        const config: MatBottomSheetConfig = {
            data: {
                noteId: this.noteId,
                noteTitle: this.noteTitle,
                noteText: this.noteEditor.text,
                noteContent: this.noteEditor.content,
                noteHtml: this.noteEditor.html,
                isMarkdownNote: this.isMarkdownNote,
                tags: this.tags,
            },
        };

        this.bottomSheet.open(ShareBottomSheetComponent, config);
    }

    public strikeThrough(event: any): void {
        this.noteEditor.applyStrikeThrough();
    }
}
