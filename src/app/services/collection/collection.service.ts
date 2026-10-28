import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { ipcRenderer } from 'electron';
import { merge, Observable, Subject } from 'rxjs';
import sanitize from 'sanitize-filename';
import { Constants } from '../../common/application/constants';
import { Operation } from '../../common/enums/operation';
import { FileAccess } from '../../common/io/file-access';
import { Logger } from '../../common/logging/logger';
import { PerformanceDiagnostics } from '../../common/logging/performance-diagnostics';
import { Scheduler } from '../../common/scheduling/scheduler';
import { BaseSettings } from '../../common/settings/base-settings';
import { TasksCount } from '../../common/ui/tasks-count';
import { CollectionUtils } from '../../common/utils/collection-utils';
import { DateUtils } from '../../common/utils/date-utils';
import { TagUtils } from '../../common/utils/tag-utils';
import { Note } from '../../data/entities/note';
import { Notebook } from '../../data/entities/notebook';
import { BaseAppearanceService } from '../appearance/base-appearance.service';
import { CryptographyService } from '../cryptography/cryptography.service';
import { NoteDateFormatResult } from '../results/note-date-format-result';
import { NoteDetailsResult } from '../results/note-details-result';
import { NoteMarkResult } from '../results/note-mark-result';
import { NoteOperationResult } from '../results/note-operation-result';
import { NotePinResult } from '../results/note-pin-result';
import { NoteLinkTargetsResult } from '../results/note-link-targets-result';
import { NotebookChangedResult } from '../results/notebook-changed-result';
import { NotesCountResult } from '../results/notes-count-result';
import { SearchService } from '../search/search.service';
import { TemporaryStorageService } from '../temporary-storage/temporary-storage.service';
import { TranslatorService } from '../translator/translator.service';
import { ClassicNoteExport } from './classic-note-export';
import { CollectionDataStoreAccess } from './collection-data-store.access';
import { CollectionEvents } from './collection-events';
import { CollectionFileAccess } from './collection-file-access';
import { MarkdownNoteExportMetadata } from './markdown-note-export-metadata';
import { NoteDateFormatter } from './note-date-formatter';
import { NoteModel } from './note-model';
import { NoteModelFactory } from './note-model-factory';

/**
 * Database access is owned by the main window. Note windows must communicate with
 * this class via the main process, never open another store for the same database.
 */
@Injectable()
export class CollectionService {
    public changeVersion: number = 0;
    private initialization: Promise<void> | undefined;
    private collectionOperationInProgress: boolean = false;
    private collectionChangeInProgress: boolean = false;
    private movingNoteIds: Set<string> = new Set();
    private isInitialized: boolean = false;
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private openNoteIds: string[] = [];

    private collectionsChanged: Subject<void> = new Subject();
    private notebookEdited: Subject<void> = new Subject();
    private notebookDeleted: Subject<void> = new Subject();
    private noteEdited: Subject<void> = new Subject();
    private notesChanged: Subject<void> = new Subject();
    private notesCountChanged: Subject<NotesCountResult> = new Subject<NotesCountResult>();
    private noteMarkChanged: Subject<NoteMarkResult> = new Subject<NoteMarkResult>();
    private notePinChanged: Subject<NotePinResult> = new Subject<NotePinResult>();
    private noteNotebookChanged: Subject<void> = new Subject();

    private setNoteOpenEventListener: any = this.setNoteOpenAsync.bind(this);
    private getNoteLinkTargetsEventListener = this.getNoteLinkTargetsEventHandler.bind(this);
    private openLinkedNoteEventListener = this.openLinkedNoteEventHandler.bind(this);
    private setNoteMarkEventListener: any = this.setNoteMark.bind(this);
    private setNotePinEventListener: any = this.setNotePin.bind(this);
    private setNotebookEventListener: any = this.setNotebook.bind(this);
    private getNoteDetailsEventListener: any = this.getNoteDetailsEventHandler.bind(this);
    private getNotebooksEventListener: any = this.getNotebooksEventHandler.bind(this);
    private saveNoteTitleEventListener: any = this.saveNoteTitleEventHandler.bind(this);
    private saveNoteTextEventListener: any = this.saveNoteTextEventHandler.bind(this);
    private saveNoteTagsEventListener = this.saveNoteTagsEventHandler.bind(this);
    private deleteNoteEventListener: any = this.deleteNoteEventHandlerAsync.bind(this);
    private encryptNoteEventListener: any = this.encryptNoteEventHandler.bind(this);
    private decryptNoteEventListener: any = this.decryptNoteEventHandler.bind(this);
    private getIsInitializedEventEventListener: any = this.getIsInitializedEventHandler.bind(this);

    private _activeCollection: string;

    constructor(
        private translator: TranslatorService,
        private search: SearchService,
        private appearance: BaseAppearanceService,
        private cryptography: CryptographyService,
        private collectionFileAccess: CollectionFileAccess,
        private collectionDataStoreAccess: CollectionDataStoreAccess,
        private temporaryStorageService: TemporaryStorageService,
        private noteModelFactory: NoteModelFactory,
        private noteDateFormatter: NoteDateFormatter,
        private fileAccess: FileAccess,
        private scheduler: Scheduler,
        private settings: BaseSettings,
        private logger: Logger,
    ) {
        merge(
            this.notebookEdited, this.notebookDeleted, this.noteEdited, this.notesChanged,
            this.noteMarkChanged, this.notePinChanged, this.noteNotebookChanged,
        ).subscribe(() => this.changeVersion++);
    }

    public collectionsChanged$: Observable<void> = this.collectionsChanged.asObservable();
    public notebookEdited$: Observable<void> = this.notebookEdited.asObservable();
    public notebookDeleted$: Observable<void> = this.notebookDeleted.asObservable();
    public noteEdited$: Observable<void> = this.noteEdited.asObservable();
    public notesChanged$: Observable<void> = this.notesChanged.asObservable();
    public notesCountChanged$: Observable<NotesCountResult> = this.notesCountChanged.asObservable();
    public noteMarkChanged$: Observable<NoteMarkResult> = this.noteMarkChanged.asObservable();
    public notePinChanged$: Observable<NotePinResult> = this.notePinChanged.asObservable();
    public noteNotebookChanged$: Observable<void> = this.noteNotebookChanged.asObservable();

    public get activeCollection(): string {
        return this._activeCollection;
    }
    public set activeCollection(v: string) {
        this._activeCollection = v;
    }

    private listenToNoteEvents(): void {
        // Remove listeners
        this.globalEmitter.removeListener(CollectionEvents.getNoteLinkTargetsEvent, this.getNoteLinkTargetsEventListener);
        this.globalEmitter.removeListener(CollectionEvents.openLinkedNoteEvent, this.openLinkedNoteEventListener);
        this.globalEmitter.removeListener(CollectionEvents.setNoteOpenEvent, this.setNoteOpenEventListener);
        this.globalEmitter.removeListener(CollectionEvents.setNoteMarkEvent, this.setNoteMarkEventListener);
        this.globalEmitter.removeListener(CollectionEvents.setNotePinEvent, this.setNotePinEventListener);
        this.globalEmitter.removeListener(CollectionEvents.setNotebookEvent, this.setNotebookEventListener);
        this.globalEmitter.removeListener(CollectionEvents.getNoteDetailsEvent, this.getNoteDetailsEventListener);
        this.globalEmitter.removeListener(CollectionEvents.getNotebooksEvent, this.getNotebooksEventListener);
        this.globalEmitter.removeListener(CollectionEvents.saveNoteTitleEvent, this.saveNoteTitleEventListener);
        this.globalEmitter.removeListener(CollectionEvents.saveNoteTextEvent, this.saveNoteTextEventListener);
        this.globalEmitter.removeListener(CollectionEvents.saveNoteTagsEvent, this.saveNoteTagsEventListener);
        this.globalEmitter.removeListener(CollectionEvents.deleteNoteEvent, this.deleteNoteEventListener);
        this.globalEmitter.removeListener(CollectionEvents.encryptNoteEvent, this.encryptNoteEventListener);
        this.globalEmitter.removeListener(CollectionEvents.decryptNoteEvent, this.decryptNoteEventListener);
        this.globalEmitter.removeListener(CollectionEvents.getIsInitializedEvent, this.getIsInitializedEventEventListener);

        // Add listeners
        this.globalEmitter.on(CollectionEvents.getNoteLinkTargetsEvent, this.getNoteLinkTargetsEventListener);
        this.globalEmitter.on(CollectionEvents.openLinkedNoteEvent, this.openLinkedNoteEventListener);
        this.globalEmitter.on(CollectionEvents.setNoteOpenEvent, this.setNoteOpenEventListener);
        this.globalEmitter.on(CollectionEvents.setNoteMarkEvent, this.setNoteMarkEventListener);
        this.globalEmitter.on(CollectionEvents.setNotePinEvent, this.setNotePinEventListener);
        this.globalEmitter.on(CollectionEvents.setNotebookEvent, this.setNotebookEventListener);
        this.globalEmitter.on(CollectionEvents.getNoteDetailsEvent, this.getNoteDetailsEventListener);
        this.globalEmitter.on(CollectionEvents.getNotebooksEvent, this.getNotebooksEventListener);
        this.globalEmitter.on(CollectionEvents.saveNoteTitleEvent, this.saveNoteTitleEventListener);
        this.globalEmitter.on(CollectionEvents.saveNoteTextEvent, this.saveNoteTextEventListener);
        this.globalEmitter.on(CollectionEvents.saveNoteTagsEvent, this.saveNoteTagsEventListener);
        this.globalEmitter.on(CollectionEvents.deleteNoteEvent, this.deleteNoteEventListener);
        this.globalEmitter.on(CollectionEvents.encryptNoteEvent, this.encryptNoteEventListener);
        this.globalEmitter.on(CollectionEvents.decryptNoteEvent, this.decryptNoteEventListener);
        this.globalEmitter.on(CollectionEvents.getIsInitializedEvent, this.getIsInitializedEventEventListener);
    }

    public hasCollections(): boolean {
        return this.collectionFileAccess.hasStorageDirectory();
    }

    public async getCollectionsAsync(): Promise<string[]> {
        return await this.collectionFileAccess.getCollectionsAsync();
    }

    public async setStorageDirectoryAsync(parentDirectory: string): Promise<boolean> {
        const operation = await this.changeCollectionAsync('setStorageDirectoryAsync', async () => {
            const storageDirectory: string = this.collectionFileAccess.createStorageDirectory(parentDirectory);
            if (storageDirectory === this.settings.storageDirectory) {
                return Operation.Success;
            }
            await this.prepareCollectionChangeAsync();
            const previousDirectory = this.settings.storageDirectory;
            const previousCollection = this.settings.activeCollection;
            const wasInitialized = this.isInitialized;
            try {
                this.settings.storageDirectory = storageDirectory;
                this.isInitialized = false;
                if (wasInitialized) {
                    await this.initializeAsync();
                }
            } catch (error) {
                this.settings.storageDirectory = previousDirectory;
                this.setActiveCollection(previousCollection);
                this.isInitialized = false;
                if (wasInitialized) {
                    await this.initializeAsync();
                }
                throw error;
            }
            this.logger.info(`Changed storage directory to '${storageDirectory}'`, 'CollectionService', 'setStorageDirectoryAsync');
            this.changeVersion++;
            this.collectionsChanged.next();
            return Operation.Success;
        });
        return operation === Operation.Success;
    }

    public async initializeAsync(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        if (this.initialization) {
            return this.initialization;
        }

        this.initialization = this.initializeCollectionAsync();
        try {
            await this.initialization;
        } catch (error) {
            this.logger.error(`Could not initialize collection. Cause: ${error}`, 'CollectionService', 'initializeAsync');
            throw error;
        } finally {
            this.initialization = undefined;
        }
    }

    private async initializeCollectionAsync(): Promise<void> {
        // Get the active collection from the settings
        let activeCollection: string = this.settings.activeCollection;
        let activeCollectionDirectory: string = '';

        if (await this.collectionFileAccess.collectionAndItsDirectoryExistAsync(this.settings.activeCollection)) {
            // There is an active collection and the collection directory exists
            activeCollectionDirectory = await this.collectionFileAccess.getCollectionDirectoryPath(this.settings.activeCollection);
        } else {
            // There is no active collection or no collection directory
            // Get all collection directories in the storage directory
            const collections: string[] = await this.collectionFileAccess.getCollectionsAsync();

            if (collections && collections.length > 0) {
                // If there are collection directories, take the first one.
                activeCollection = collections[0];
            } else {
                // If there are no collection directories, create a default collection.
                activeCollection = Constants.defaultCollection;
            }

            // If the collection directory doesn't exist, create it.
            await this.collectionFileAccess.createCollectionDirectoryIfNotExistsAsync(activeCollection);
        }

        this.setActiveCollection(activeCollection);

        // Initialize the data store.
        await this.collectionDataStoreAccess.initializeAsync(activeCollection);

        this.logger.info(`Initialized collection: ${activeCollection}`, 'CollectionService', 'initializeAsync');

        // Only an initialized collectionService can process global requests
        this.listenToNoteEvents();

        this.isInitialized = true;
    }

    private setActiveCollection(activeCollection: string): void {
        this.activeCollection = activeCollection;
        this.settings.activeCollection = activeCollection;
    }

    public async addCollectionAsync(possiblyDirtyCollection: string): Promise<Operation> {
        return this.changeCollectionAsync('addCollectionAsync', () => this.addCollectionCoreAsync(possiblyDirtyCollection));
    }

    private async addCollectionCoreAsync(possiblyDirtyCollection: string): Promise<Operation> {
        // Check if a collection was provided
        if (!possiblyDirtyCollection) {
            this.logger.error('possiblyDirtyCollection is null', 'CollectionService', 'addCollectionAsync');
            return Operation.Error;
        }

        const sanitizedCollection: string = sanitize(possiblyDirtyCollection);

        try {
            // Check if there is already a collection with that name
            if (await this.collectionExistsAsync(sanitizedCollection)) {
                this.logger.info(
                    `Not adding collection '${sanitizedCollection}' because it already exists`,
                    'CollectionService',
                    'addCollectionAsync',
                );
                return Operation.Duplicate;
            }

            await this.prepareCollectionChangeAsync();
            // Add the collection
            await this.collectionFileAccess.createCollectionDirectoryAsync(sanitizedCollection);
            this.changeVersion++;

            this.logger.info(`Added collection '${sanitizedCollection}'`, 'CollectionService', 'addCollectionAsync');

            // Activate the added collection
            this.settings.activeCollection = sanitizedCollection;
        } catch (error) {
            this.logger.error(
                `Could not add collection '${sanitizedCollection}'. Cause: ${error}`,
                'CollectionService',
                'addCollectionAsync',
            );

            return Operation.Error;
        }

        this.isInitialized = false;
        this.collectionsChanged.next();

        return Operation.Success;
    }

    public async renameCollectionAsync(oldCollection: string, newCollection: string): Promise<Operation> {
        return this.changeCollectionAsync('renameCollectionAsync', () => this.renameCollectionCoreAsync(oldCollection, newCollection));
    }

    private async renameCollectionCoreAsync(oldCollection: string, newCollection: string): Promise<Operation> {
        if (!newCollection) {
            this.logger.error('newCollection is null', 'CollectionService', 'renameCollectionAsync');
            return Operation.Error;
        }

        // No rename required
        if (oldCollection.toLowerCase() === newCollection.toLowerCase()) {
            return Operation.Aborted;
        }

        try {
            if (await this.collectionExistsAsync(newCollection)) {
                return Operation.Duplicate;
            }

            await this.prepareCollectionChangeAsync();
            await this.collectionFileAccess.renameCollectionFiles(oldCollection, newCollection);
            this.changeVersion++;
            this.settings.activeCollection = newCollection;
        } catch (error) {
            this.logger.error(
                `Could not rename the collection '${oldCollection}' to '${newCollection}'. Cause: ${error}`,
                'CollectionService',
                'renameCollectionAsync',
            );

            return Operation.Error;
        }

        this.isInitialized = false;
        this.collectionsChanged.next();

        return Operation.Success;
    }

    public async deleteCollectionAsync(collection: string): Promise<Operation> {
        return this.changeCollectionAsync('deleteCollectionAsync', () => this.deleteCollectionCoreAsync(collection));
    }

    private async deleteCollectionCoreAsync(collection: string): Promise<Operation> {
        try {
            await this.prepareCollectionChangeAsync();
            await this.collectionFileAccess.deleteCollectionDirectoryAsync(collection);
            this.changeVersion++;
            const collections: string[] = await this.collectionFileAccess.getCollectionsAsync();

            if (collections && collections.length > 0) {
                this.settings.activeCollection = collections[0];
            } else {
                this.settings.activeCollection = '';
            }
        } catch (error) {
            this.logger.error(
                `Could not delete the collection '${collection}'. Cause: ${error}`,
                'CollectionService',
                'deleteCollectionAsync',
            );
            return Operation.Error;
        }

        this.isInitialized = false;
        this.collectionsChanged.next();

        return Operation.Success;
    }

    public async activateCollection(collection: string): Promise<Operation> {
        return this.changeCollectionAsync('activateCollection', async () => {
            await this.prepareCollectionChangeAsync();
            this.setActiveCollection(collection);
            this.isInitialized = false;
            this.collectionsChanged.next();
            return Operation.Success;
        });
    }

    private async changeCollectionAsync(action: string, change: () => Promise<Operation>): Promise<Operation> {
        if (this.collectionOperationInProgress) {
            this.logger.error('Another collection operation is in progress.', 'CollectionService', action);
            return Operation.Error;
        }

        this.collectionOperationInProgress = true;
        this.collectionChangeInProgress = true;
        try {
            if (this.initialization) {
                await this.initialization;
            }
            return await change();
        } catch (error) {
            this.logger.error(`Could not change collection. Cause: ${error}`, 'CollectionService', action);
            return Operation.Error;
        } finally {
            this.collectionChangeInProgress = false;
            this.collectionOperationInProgress = false;
        }
    }

    private async prepareCollectionChangeAsync(): Promise<void> {
        for (const noteId of [...this.openNoteIds]) {
            await this.prepareNoteDeletionAsync(noteId);
        }
        if (this.isInitialized) {
            await this.collectionDataStoreAccess.saveAsync();
        }
    }

    public getActiveCollection(): string {
        return this.settings.activeCollection;
    }

    public noteIsOpen(noteId: string): boolean {
        if (this.openNoteIds.includes(noteId)) {
            return true;
        }

        return false;
    }

    public hasOpenNotes(): boolean {
        return this.openNoteIds.length > 0;
    }

    public async prepareBackupAsync(collection: string, storage: string): Promise<string> {
        if (storage !== this.settings.storageDirectory || this.collectionOperationInProgress ||
            this.initialization || this.movingNoteIds.size > 0) {
            throw Object.assign(new Error('The collection is changing. Backup will be retried later.'), { code: 'BACKUP_POSTPONED' });
        }
        if (collection !== this.settings.activeCollection) {
            return collection;
        }
        await this.initializeAsync();
        const noteIds = [...this.openNoteIds].sort();
        const revisions: string[] = [];
        for (const noteId of noteIds) {
            const result = await new Promise<string>((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timed out saving an open note for backup.')), 15000);
                this.globalEmitter.emit(CollectionEvents.prepareNoteBackupEvent, noteId, (response: string) => {
                    clearTimeout(timeout);
                    resolve(response);
                });
            });
            const response = JSON.parse(result);
            if (response.error) {
                throw Object.assign(new Error(response.error), { code: response.code });
            }
            revisions.push(`${noteId}:${result}`);
        }
        if (this.collectionOperationInProgress || collection !== this.settings.activeCollection ||
            JSON.stringify(noteIds) !== JSON.stringify([...this.openNoteIds].sort())) {
            throw Object.assign(new Error('The collection changed while preparing backup.'), { code: 'BACKUP_POSTPONED' });
        }
        await this.collectionDataStoreAccess.saveAsync();
        return JSON.stringify(revisions);
    }

    public restoredCollectionAvailable(): void {
        this.changeVersion++;
        this.collectionsChanged.next();
    }

    public async getNotebooksAsync(includeAllNotes: boolean): Promise<Notebook[]> {
        const notebooks: Notebook[] = [];

        try {
            // Add the default notebooks
            if (includeAllNotes) {
                const allNotesNotebook: Notebook = new Notebook(await this.translator.getAsync('MainPage.AllNotes'));
                allNotesNotebook.id = Constants.allNotesNotebookId;
                allNotesNotebook.isDefault = true;
                notebooks.push(allNotesNotebook);
            }

            const unfiledNotesNotebook: Notebook = new Notebook(await this.translator.getAsync('MainPage.UnfiledNotes'));
            unfiledNotesNotebook.id = Constants.unfiledNotesNotebookId;
            unfiledNotesNotebook.isDefault = true;
            notebooks.push(unfiledNotesNotebook);

            // 4. Get the user defined notebooks
            const userNotebooks: Notebook[] = this.collectionDataStoreAccess.getNotebooks();

            // 5. Add the user defined notebooks to the notebooks
            notebooks.push(...userNotebooks.filter((notebook) => this.settings.showArchivedNotebooks || !notebook.isArchived));
        } catch (error) {
            this.logger.error(`Could not get notebooks. Cause: ${error}`, 'CollectionService', 'getNotebooksAsync');
        }

        return notebooks;
    }

    public addNotebook(notebookName: string): Operation {
        // Check if a notebook name was provided
        if (!notebookName) {
            this.logger.error('notebookName is null', 'CollectionService', 'addNotebook');
            return Operation.Error;
        }

        try {
            // Check if there is already a notebook with that name
            if (this.notebookExists(notebookName)) {
                this.logger.info(
                    `Not adding notebook '${notebookName}' to the data store because it already exists`,
                    'CollectionService',
                    'addNotebook',
                );
                return Operation.Duplicate;
            }

            // Add the notebook to the data store
            this.collectionDataStoreAccess.addNotebook(notebookName);
            this.logger.info(`Added notebook '${notebookName}' to the data store`, 'CollectionService', 'addNotebook');
        } catch (error) {
            this.logger.error(`Could not add notebook '${notebookName}'. Cause: ${error}`, 'CollectionService', 'addNotebook');

            return Operation.Error;
        }

        this.notebookEdited.next();

        return Operation.Success;
    }

    public async renameNotebookAsync(notebookId: string, newNotebookName: string): Promise<Operation> {
        // Check if a notebook name was provided
        if (!newNotebookName) {
            this.logger.error('newNotebookName is null', 'CollectionService', 'renameNotebookAsync');
            return Operation.Error;
        }

        try {
            // Check if there is already a notebook with that name
            if (this.notebookExists(newNotebookName)) {
                return Operation.Duplicate;
            }

            // Get the notebook
            const notebook: Notebook = this.collectionDataStoreAccess.getNotebookById(notebookId);

            if (notebook.name === newNotebookName) {
                // No rename required
                return Operation.Aborted;
            }

            // Rename the notebook
            notebook.name = newNotebookName;
            this.collectionDataStoreAccess.updateNotebook(notebook);
        } catch (error) {
            this.logger.error(
                `Could not rename the notebook with id='${notebookId}' to '${newNotebookName}'. Cause: ${error}`,
                'CollectionService',
                'renameNotebookAsync',
            );

            return Operation.Error;
        }

        this.notebookEdited.next();

        return Operation.Success;
    }

    public getNotebookName(notebookId: string): string {
        return this.collectionDataStoreAccess.getNotebookById(notebookId).name;
    }

    public async setNotebooksArchivedAsync(notebookIds: string[], isArchived: boolean): Promise<Operation> {
        const previousStates: { notebook: Notebook; isArchived: boolean | undefined }[] = [];

        try {
            if (this.collectionChangeInProgress || notebookIds.length === 0) {
                throw new Error('Cannot archive notebooks while the collection is changing or without a selection.');
            }

            for (const notebookId of new Set(notebookIds)) {
                const notebook = this.collectionDataStoreAccess.getNotebookById(notebookId);
                if (!notebook || notebook.isDefault ||
                    notebookId === Constants.allNotesNotebookId || notebookId === Constants.unfiledNotesNotebookId) {
                    throw new Error(`Notebook with id=${notebookId} cannot be archived.`);
                }
                previousStates.push({ notebook, isArchived: notebook.isArchived });
            }

            for (const state of previousStates) {
                state.notebook.isArchived = isArchived;
                this.collectionDataStoreAccess.updateNotebook(state.notebook, false);
            }
            await this.collectionDataStoreAccess.saveAsync();
        } catch (error) {
            for (const state of previousStates) {
                state.notebook.isArchived = state.isArchived;
            }
            this.logger.error(`Could not change notebook archive state. Cause: ${error}`,
                'CollectionService', 'setNotebooksArchivedAsync');
            return Operation.Error;
        }

        this.notebookEdited.next();
        this.notesChanged.next();
        return Operation.Success;
    }

    public async deleteNotebooksAsync(notebookIds: string[]): Promise<Operation> {
        let operation: Operation = Operation.Success;

        for (const notebookId of notebookIds) {
            try {
                this.collectionDataStoreAccess.deleteNotebook(notebookId);
            } catch (error) {
                this.logger.error(
                    `Could not delete the notebook with id='${notebookId}'. Cause: ${error}`,
                    'CollectionService',
                    'deleteNotebooksAsync',
                );
                operation = Operation.Error;
            }
        }

        this.notebookDeleted.next();

        return operation;
    }

    private async deleteNotePermanentlyAsync(noteId: string): Promise<void> {
        const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);
        await this.collectionFileAccess.deleteNoteFilesAsync(noteId, this.settings.activeCollection, note.isMarkdownNote);
        this.collectionDataStoreAccess.deleteNote(noteId);
    }

    public async deleteNotesPermanentlyAsync(noteIds: string[]): Promise<Operation> {
        let operation: Operation = Operation.Success;

        for (const noteId of noteIds) {
            try {
                await this.deleteNotePermanentlyAsync(noteId);
            } catch (error) {
                this.logger.error(
                    `Could not permanently delete the note with id='${noteId}'. Cause: ${error}`,
                    'CollectionService',
                    'deleteNotesPermanentlyAsync',
                );

                operation = Operation.Error;
            }
        }

        this.notesChanged.next();

        return operation;
    }

    public async deleteNotesAsync(noteIds: string[]): Promise<Operation> {
        let operation: Operation = Operation.Success;

        for (const noteId of noteIds) {
            try {
                await this.prepareNoteDeletionAsync(noteId);
                const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);
                const skipTrash: boolean =
                    this.settings.moveDeletedNotesToTrash &&
                    this.settings.skipTrashForEmptyNotes &&
                    (await this.isNoteEmptyAsync(note));

                if (this.settings.moveDeletedNotesToTrash && !skipTrash) {
                    this.collectionDataStoreAccess.trashNote(noteId);
                } else {
                    await this.deleteNotePermanentlyAsync(noteId);
                }
            } catch (error) {
                this.logger.error(
                    `Could not delete the note with id='${noteId}'. Cause: ${error}`,
                    'CollectionService',
                    'deleteNotesAsync',
                );
                operation = Operation.Error;
            }
        }

        this.notesChanged.next();

        return operation;
    }

    private async prepareNoteDeletionAsync(noteId: string): Promise<void> {
        if (!this.noteIsOpen(noteId)) {
            return;
        }

        let operation: Operation;
        this.globalEmitter.emit(CollectionEvents.prepareNoteDeletionEvent, noteId, (result: Operation) => (operation = result));

        for (let attempt = 0; operation === undefined && attempt < 200; attempt++) {
            await this.scheduler.sleepAsync(50);
        }

        if (operation !== Operation.Success) {
            throw new Error(`Could not save and close note '${noteId}' before deletion.`);
        }
    }

    private async isNoteEmptyAsync(note: Note): Promise<boolean> {
        // Encrypted content cannot be classified safely without its secret key.
        if (note.isEncrypted || note.text.trim().length > 0) {
            return false;
        }

        const content: string = await this.collectionFileAccess.getNoteContentByNoteIdAsync(
            note.id,
            this.settings.activeCollection,
            note.isMarkdownNote,
        );

        if (content.trim().length > 0) {
            if (note.isMarkdownNote) {
                return false;
            }

            const delta: unknown = JSON.parse(content);
            if (typeof delta !== 'object' || delta === null || !('ops' in delta) || !Array.isArray(delta.ops)) {
                throw new Error(`Invalid classic note content for note '${note.id}'.`);
            }

            const ops: unknown[] = delta.ops;
            for (const op of ops) {
                if (typeof op !== 'object' || op === null || !('insert' in op)) {
                    throw new Error(`Invalid classic note operation for note '${note.id}'.`);
                }
                if (typeof op.insert !== 'string' || op.insert.trim().length > 0) {
                    return false;
                }
            }
        }

        const attachmentsDirectory: string = this.collectionFileAccess.getNoteAttachmentsDirectoryPath(
            note.id,
            this.settings.activeCollection,
        );
        return (
            !this.fileAccess.pathExists(attachmentsDirectory) ||
            (await this.fileAccess.getFilesInDirectoryAsync(attachmentsDirectory)).length === 0
        );
    }

    public restoreNotes(noteIds: string[]): Operation {
        let operation: Operation = Operation.Success;

        for (const noteId of noteIds) {
            try {
                this.collectionDataStoreAccess.restoreNote(noteId);
            } catch (error) {
                this.logger.error(`Could not restore the note with id='${noteId}'. Cause: ${error}`, 'CollectionService', 'restoreNotes');

                operation = Operation.Error;
            }
        }

        this.notesChanged.next();

        return operation;
    }

    public async getNotesAsync(notebookId: string, category: string, useExactDates: boolean): Promise<Note[]> {
        const finish = PerformanceDiagnostics.start('Collection.refreshNotes', true);
        const notesCountResult: NotesCountResult = new NotesCountResult();

        let notes: Note[] = [];

        try {
            // Get the notes from the data store
            let uncategorizedNotes: Note[] = [];

            if (notebookId === Constants.allNotesNotebookId) {
                uncategorizedNotes = this.collectionDataStoreAccess.getNotes();
            } else if (notebookId === Constants.unfiledNotesNotebookId) {
                uncategorizedNotes = this.collectionDataStoreAccess.getUnfiledNotes();
            } else {
                uncategorizedNotes = this.collectionDataStoreAccess.getNotebookNotes(notebookId);
            }

            uncategorizedNotes = this.getVisibleNotes(uncategorizedNotes);

            // Set pinned notes at the top
            let pinnedUncategorizedNotes: Note[] = uncategorizedNotes.filter((x) => x.isPinned);
            let unpinnedUncategorizedNotes: Note[] = uncategorizedNotes.filter((x) => !x.isPinned);

            uncategorizedNotes = [];
            uncategorizedNotes.push(...pinnedUncategorizedNotes);
            uncategorizedNotes.push(...unpinnedUncategorizedNotes);

            uncategorizedNotes = this.getFilteredNotes(uncategorizedNotes, this.search.searchText);

            // Fill in count
            notesCountResult.allNotesCount = uncategorizedNotes.length;

            const markedNotes: Note[] = uncategorizedNotes.filter((x) => x.isMarked);
            notesCountResult.markedNotesCount = markedNotes.length;

            if (category === Constants.markedCategory) {
                notes = markedNotes;
            }

            // Fill in the display date & notes array
            for (const note of uncategorizedNotes) {
                if (category === Constants.allCategory) {
                    notes.push(note);
                }

                const result: NoteDateFormatResult = await this.noteDateFormatter.getNoteDateFormatAsync(
                    note.modificationDate,
                    useExactDates,
                );

                // More counts
                if (result.isTodayNote) {
                    if (category === Constants.todayCategory) {
                        notes.push(note);
                    }

                    notesCountResult.todayNotesCount++;
                }

                if (result.isYesterdayNote) {
                    if (category === Constants.yesterdayCategory) {
                        notes.push(note);
                    }

                    notesCountResult.yesterdayNotesCount++;
                }

                if (result.isThisWeekNote) {
                    if (category === Constants.thisWeekCategory) {
                        notes.push(note);
                    }

                    notesCountResult.thisWeekNotesCount++;
                }

                // Date text
                note.displayModificationDate = result.dateText;
                note.displayExactModificationDate = DateUtils.getFormattedDate(note.modificationDate);
            }

            this.notesCountChanged.next(notesCountResult);
        } catch (error) {
            this.logger.error(`Could not get notes. Cause: ${error}`, 'CollectionService', 'getNotesAsync');
        } finally {
            finish(`returnedNotes=${notes.length}; matchingNotes=${notesCountResult.allNotesCount}`);
        }

        return notes;
    }

    public async addNoteAsync(notebookId: string, isMarkdownNote: boolean): Promise<NoteOperationResult> {
        let uniqueTitle: string = '';
        const result: NoteOperationResult = new NoteOperationResult(Operation.Success);

        // If a default notebook was selected, make sure the note is added as unfiled.
        if (notebookId === Constants.allNotesNotebookId || notebookId === Constants.unfiledNotesNotebookId) {
            notebookId = '';
        }

        try {
            // 1. Add note to data store
            const baseTitle: string = await this.translator.getAsync('Notes.NewNote');
            uniqueTitle = this.getUniqueNoteTitle(baseTitle, true);
            result.noteId = this.collectionDataStoreAccess.addNote(uniqueTitle, notebookId, isMarkdownNote);

            // 2. Create note file
            await this.collectionFileAccess.saveNoteContentAsync(result.noteId, '', this.settings.activeCollection, isMarkdownNote);
            this.noteEdited.next();
        } catch (error) {
            this.logger.error(`Could not add note '${uniqueTitle}'. Cause: ${error}`, 'CollectionService', 'addNote');
            result.operation = Operation.Error;
        }

        return result;
    }

    public getNote(noteId: string): Note {
        return this.collectionDataStoreAccess.getNoteById(noteId);
    }

    public async getNotebookAsync(noteId: string): Promise<Notebook> {
        const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);
        let notebook: Notebook = this.collectionDataStoreAccess.getNotebookById(note.notebookId);

        if (!note.notebookId || !notebook) {
            notebook = new Notebook(await this.translator.getAsync('MainPage.UnfiledNotes'));
        }

        return notebook;
    }

    public setNoteMark(noteId: string, isMarked: boolean): void {
        const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);
        note.isMarked = isMarked;
        this.collectionDataStoreAccess.updateNoteWithoutDate(note);

        const markedNotes: Note[] = this.getVisibleNotes(this.collectionDataStoreAccess.getMarkedNotes());
        const result: NoteMarkResult = new NoteMarkResult(noteId, note.isMarked, markedNotes.length);

        this.noteMarkChanged.next(result);
        this.onNoteMarkChanged(note.id, note.isMarked);
    }

    public setNotePin(noteId: string, isPinned: boolean): void {
        const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);
        note.isPinned = isPinned;
        this.collectionDataStoreAccess.updateNoteWithoutDate(note);

        const result: NotePinResult = new NotePinResult(noteId, note.isPinned);

        this.notePinChanged.next(result);
        this.onNotePinChanged(note.id, note.isPinned);
    }

    public setNotebook(notebookId: string, noteIds: string[]): Operation {
        let setNotebookOperation: Operation = Operation.Success;

        for (const noteId of noteIds) {
            try {
                const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);

                if (notebookId === Constants.allNotesNotebookId || notebookId === note.notebookId) {
                    // Skip this note
                    continue;
                }

                if (notebookId === Constants.unfiledNotesNotebookId) {
                    notebookId = '';
                }

                note.notebookId = notebookId;
                this.collectionDataStoreAccess.updateNote(note);
                this.sendNotebookNameAsync(noteId);
            } catch (error) {
                this.logger.error(
                    `Could not set the notebook for the note with id='${noteId}' to notebook with id='${notebookId}'. Cause: ${error}`,
                    'CollectionService',
                    'setNotebook',
                );
                setNotebookOperation = Operation.Error;
            }
        }

        this.noteNotebookChanged.next();

        return setNotebookOperation;
    }

    public saveNoteTitleEventHandler(noteId: string, initialNoteTitle: string, finalNoteTitle: string, callback: any): void {
        let uniqueNoteTitle: string = finalNoteTitle.trim();

        if (uniqueNoteTitle.length === 0) {
            callback(new NoteOperationResult(Operation.Blank));
            return;
        }

        if (initialNoteTitle !== uniqueNoteTitle) {
            try {
                // 1. Make sure the final title is unique
                uniqueNoteTitle = this.getUniqueNoteTitle(finalNoteTitle, false);

                // 2. Rename the note
                const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);

                if (note) {
                    note.title = uniqueNoteTitle;
                    this.collectionDataStoreAccess.updateNote(note);

                    this.logger.info(
                        `Renamed note with id=${noteId} from ${initialNoteTitle} to ${uniqueNoteTitle}.`,
                        'CollectionService',
                        'saveNoteTitleEventHandler',
                    );
                } else {
                    this.logger.warn(
                        `Note with id=${noteId} could not be found. It was probably deleted.`,
                        'CollectionService',
                        'saveNoteTitleEventHandler',
                    );
                }
            } catch (error) {
                this.logger.error(
                    `Could not rename the note with id='${noteId}' to '${uniqueNoteTitle}'. Cause: ${error}`,
                    'CollectionService',
                    'saveNoteTitleEventHandler',
                );
                callback(new NoteOperationResult(Operation.Error));
                return;
            }
        } else {
            this.logger.info(
                'Final title is the same as initial title. No rename required.',
                'CollectionService',
                'saveNoteTitleEventHandler',
            );
        }

        const result: NoteOperationResult = new NoteOperationResult(Operation.Success);
        result.noteId = noteId;
        result.noteTitle = uniqueNoteTitle;

        this.noteEdited.next();
        callback(result);
    }

    public saveNoteTextEventHandler(
        noteId: string,
        noteText: string,
        isEncrypted: boolean,
        secretKey: string,
        tasksCount: TasksCount,
        callback: any,
    ): void {
        try {
            const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);

            if (note) {
                if (isEncrypted) {
                    note.text = this.cryptography.encrypt(noteText, secretKey);
                } else {
                    note.text = noteText;
                }

                note.closedTasksCount = tasksCount.closedTasksCount;
                note.totalTasksCount = tasksCount.totalTasksCount;
                this.collectionDataStoreAccess.updateNote(note);

                this.logger.info(`Set text of note with id=${noteId}.`, 'CollectionService', 'saveNoteTextEventHandler');
            } else {
                this.logger.warn(
                    `Note with id=${noteId} could not be found. It was probably deleted.`,
                    'CollectionService',
                    'saveNoteTextEventHandler',
                );
            }
        } catch (error) {
            this.logger.error(
                `Could not set text for the note with id='${noteId}' in the data store. Cause: ${error}`,
                'CollectionService',
                'saveNoteTextEventHandler',
            );
            callback(Operation.Error);
            return;
        }

        this.noteEdited.next();
        callback(Operation.Success);
        return;
    }

    public async deleteNoteEventHandlerAsync(noteId: string): Promise<void> {
        await this.deleteNotesAsync([noteId]);
    }

    public async saveNoteTagsAsync(noteId: string, tags: string[]): Promise<Operation> {
        let note: Note;
        let previousTags: string[];
        try {
            const normalizedTags: string[] = TagUtils.normalize(tags);
            if (this.collectionChangeInProgress || this.movingNoteIds.has(noteId)) {
                throw new Error('Cannot edit tags while the note is moving or the collection is changing.');
            }
            note = this.collectionDataStoreAccess.getNoteById(noteId);
            if (!note) {
                throw new Error(`Note with id=${noteId} could not be found.`);
            }
            previousTags = note.tags;
            note.tags = normalizedTags;
            this.collectionDataStoreAccess.updateNoteWithoutDate(note);
            await this.collectionDataStoreAccess.saveAsync();
        } catch (error) {
            if (note) {
                note.tags = previousTags;
            }
            this.logger.error(`Could not save tags for note with id=${noteId}. Cause: ${error}`,
                'CollectionService', 'saveNoteTagsEventHandler');
            return Operation.Error;
        }

        this.noteEdited.next();
        return Operation.Success;
    }

    public async saveNoteTagsEventHandler(
        noteId: string,
        tags: string[],
        callback: (operation: Operation) => void,
    ): Promise<void> {
        callback(await this.saveNoteTagsAsync(noteId, tags));
    }

    public async moveNotesToCollectionAsync(noteIds: string[], newCollection: string): Promise<number> {
        if (this.collectionOperationInProgress || newCollection === this.settings.activeCollection) {
            this.logger.error('Cannot move notes while another collection operation is in progress or to the active collection.',
                'CollectionService', 'moveNotesToCollectionAsync');
            return 0;
        }

        this.collectionOperationInProgress = true;
        this.movingNoteIds = new Set(noteIds);
        try {
            if (this.initialization) {
                await this.initialization;
            }
            const noteModels: NoteModel[] = [];

            for (const noteId of noteIds) {
                await this.prepareNoteDeletionAsync(noteId);
                const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);
                noteModels.push(this.noteModelFactory.create(note));
            }

            const destination = await this.collectionDataStoreAccess.openCollectionAsync(newCollection);

            try {
                for (const noteModel of noteModels) {
                    await this.copyNoteToCollectionAsync(noteModel, newCollection, destination);
                }
            } finally {
                await destination.saveAsync();
            }

            if (await this.deleteNotesPermanentlyAsync(noteIds) !== Operation.Success) {
                return 0;
            }
            await this.collectionDataStoreAccess.saveAsync();

            return noteIds.length;
        } catch (error) {
            this.logger.error(
                `Could not move ${noteIds.length} notes to collection '${newCollection}'. Error: ${error.message}`,
                'CollectionService',
                'moveNotesToCollectionAsync',
            );

            return 0;
        } finally {
            this.movingNoteIds.clear();
            this.collectionOperationInProgress = false;
        }
    }

    public async importNoteFilesAsync(noteFilePaths: string[], notebookId?: string): Promise<Operation> {
        let numberOfImportedNoteFiles: number = 0;
        let operation: Operation = Operation.Success;

        for (const noteFilePath of noteFilePaths) {
            try {
                if (this.collectionFileAccess.isMarkdownNoteExport(noteFilePath)) {
                    await this.importMarkdownNoteAsync(noteFilePath, notebookId);
                } else {
                    await this.importClassicNoteAsync(noteFilePath, notebookId);
                }

                numberOfImportedNoteFiles++;
            } catch (error) {
                this.logger.error(
                    `An error occurred while importing note file '${noteFilePath}'. Cause: ${error}`,
                    'CollectionService',
                    'importNoteFilesAsync',
                );
                operation = Operation.Error;
            }
        }

        if (numberOfImportedNoteFiles > 0) {
            this.noteEdited.next();
        }

        return operation;
    }

    private async importNoteToDatastoreAsync(
        noteTitle: string,
        noteText: string,
        notebookId: string,
        isMarkdownNote: boolean,
        tags: string[] = [],
    ): Promise<string> {
        const normalizedTags: string[] = TagUtils.normalize(tags);
        const uniqueNoteTitle: string = await this.getUniqueImportedNoteTitleAsync(noteTitle);

        this.collectionDataStoreAccess.addNote(uniqueNoteTitle, '', isMarkdownNote);

        const note: Note = this.collectionDataStoreAccess.getNoteByTitle(uniqueNoteTitle);
        note.text = noteText;
        note.tags = normalizedTags;

        if (notebookId && notebookId !== Constants.allNotesNotebookId && notebookId !== Constants.unfiledNotesNotebookId) {
            note.notebookId = notebookId;
        }

        this.collectionDataStoreAccess.updateNoteWithoutDate(note);

        return note.id;
    }

    private async getUniqueImportedNoteTitleAsync(baseTitle: string): Promise<string> {
        const proposedTitleSuffix: string = await this.translator.getAsync('Notes.Imported');
        let proposedNoteTitle: string = baseTitle;

        const proposedTitleSuffixWithBrackets: string = `(${proposedTitleSuffix})`;

        if (!proposedNoteTitle.includes(proposedTitleSuffixWithBrackets)) {
            proposedNoteTitle = `${baseTitle} ${proposedTitleSuffixWithBrackets}`;
        }

        const uniqueNoteTitle: string = this.getUniqueNoteTitle(proposedNoteTitle, false);

        return uniqueNoteTitle;
    }

    private async importMarkdownNoteAsync(noteFilePath: string, notebookId?: string): Promise<void> {
        const extractionPath: string = await this.temporaryStorageService.extractArchiveAsync(noteFilePath);

        const metadataPath: string = this.fileAccess.combinePath(extractionPath, 'metadata.json');
        const metadataContent: string = await this.collectionFileAccess.getNoteContentAsync(metadataPath);
        const metadata: MarkdownNoteExportMetadata = JSON.parse(metadataContent);

        const filePathsInExtractionPath: string[] = await this.fileAccess.getFilesInDirectoryAsync(extractionPath);
        let noteContentPath: string = '';

        for (const filePathInExtractionPath of filePathsInExtractionPath) {
            if (
                this.fileAccess.getFileExtension(filePathInExtractionPath).toLowerCase() ===
                Constants.markdownNoteContentExtension.toLowerCase()
            ) {
                noteContentPath = filePathInExtractionPath;
            }
        }

        const noteContent: string = this.fileAccess.getFileContentAsString(noteContentPath);

        const noteId: string = await this.importNoteToDatastoreAsync(metadata.title, noteContent, notebookId, true, metadata.tags);

        await this.collectionFileAccess.saveNoteContentAsync(noteId, noteContent, this.settings.activeCollection, true);

        const attachmentsDirectoryPath: string = this.fileAccess.combinePath(extractionPath, 'attachments');
        await this.collectionFileAccess.copyAttachmentsAsync(noteId, this.settings.activeCollection, attachmentsDirectoryPath);
    }

    private async importClassicNoteAsync(noteFilePath: string, notebookId?: string): Promise<void> {
        const noteFileContent: string = await this.collectionFileAccess.getNoteContentAsync(noteFilePath);
        const classicNoteExport: ClassicNoteExport = JSON.parse(noteFileContent);

        const noteId: string = await this.importNoteToDatastoreAsync(
            classicNoteExport.title, classicNoteExport.text, notebookId, false, classicNoteExport.tags,
        );

        await this.collectionFileAccess.saveNoteContentAsync(noteId, classicNoteExport.content, this.settings.activeCollection, false);
    }

    private async getUniqueTitleForMovedNoteAsync(title: string, destination: CollectionDataStoreAccess): Promise<string> {
        const titleSuffix: string = await this.translator.getAsync('Notes.Moved');
        const titleSuffixWithBrackets: string = `(${titleSuffix})`;

        let noteTitle: string = title;

        if (!noteTitle.includes(titleSuffixWithBrackets)) {
            noteTitle = `${title} ${titleSuffixWithBrackets}`;
        }

        const uniqueNoteTitle: string = this.getUniqueNoteTitle(noteTitle, false, destination);

        return uniqueNoteTitle;
    }

    private async copyNoteToCollectionAsync(
        noteModel: NoteModel,
        newCollection: string,
        destination: CollectionDataStoreAccess,
    ): Promise<void> {
        const uniqueNoteTitle: string = await this.getUniqueTitleForMovedNoteAsync(noteModel.title, destination);

        const noteId = destination.addNote(uniqueNoteTitle, '', noteModel.isMarkdownNote);

        const note: Note = destination.getNoteById(noteId);
        note.text = noteModel.text;
        note.isMarkdownNote = noteModel.isMarkdownNote;
        note.tags = noteModel.tags;

        destination.updateNoteWithoutDate(note);

        await this.collectionFileAccess.saveNoteContentAsync(note.id, noteModel.content, newCollection, note.isMarkdownNote);

        if (note.isMarkdownNote) {
            await this.collectionFileAccess.copyAttachmentsAsync(note.id, newCollection, noteModel.attachmentsDirectoryPath);
        }
    }

    public getTrashedNotes(): Note[] {
        const trashedNotes: Note[] = this.collectionDataStoreAccess.getTrashedNotes();

        if (trashedNotes == undefined) {
            return [];
        }

        const visibleNotes = this.getVisibleNotes(trashedNotes);
        for (const trashedNote of visibleNotes) {
            trashedNote.isSelected = false;
            trashedNote.displayTrashedDate = DateUtils.getFormattedDate(trashedNote.trashedDate);
        }

        return visibleNotes;
    }

    private async collectionExistsAsync(collection: string): Promise<boolean> {
        const collections: string[] = await this.collectionFileAccess.getCollectionsAsync();
        const existingCollections: string[] = collections.filter((x) => x.toLowerCase() === collection.toLowerCase());

        return existingCollections && existingCollections.length > 0;
    }

    private async getNoteDetailsEventHandler(noteId: string, callback: any): Promise<void> {
        const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);
        let notebookName: string = await this.translator.getAsync('MainPage.UnfiledNotes');

        if (note.notebookId) {
            const notebook: Notebook = this.collectionDataStoreAccess.getNotebookById(note.notebookId);

            if (notebook) {
                notebookName = notebook.name;
            }
        }

        callback(
            new NoteDetailsResult(
                note.title,
                notebookName,
                note.isMarked,
                note.isPinned,
                note.isTrashed,
                note.isEncrypted,
                note.secretKeyHash,
                note.isMarkdownNote,
                TagUtils.normalize(note.tags),
            ),
        );
    }

    private async sendNotebookNameAsync(noteId: string): Promise<void> {
        const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);
        let notebookName: string = await this.translator.getAsync('MainPage.UnfiledNotes');

        if (note.notebookId) {
            const notebook: Notebook = this.collectionDataStoreAccess.getNotebookById(note.notebookId);

            if (notebook) {
                notebookName = notebook.name;
            }
        }

        this.onNotebookChanged(noteId, notebookName);
    }

    private async getNotebooksEventHandler(callback: any): Promise<void> {
        const notebooks: Notebook[] = await this.getNotebooksAsync(false);
        callback(notebooks);
    }

    private async getNoteLinkTargetsEventHandler(callback: (serializedResult: string) => void): Promise<void> {
        try {
            const unfiledName = await this.translator.getAsync('MainPage.UnfiledNotes');
            const notes = this.collectionDataStoreAccess.getNotes()
                .filter((note) => !note.isTrashed)
                .map((note) => ({
                    id: note.id,
                    title: note.title,
                    notebookName: this.collectionDataStoreAccess.getNotebookById(note.notebookId)?.name || unfiledName,
                }))
                .sort((a, b) => a.title.localeCompare(b.title));
            const result: NoteLinkTargetsResult = { operation: Operation.Success, notes };
            // Remote object properties require synchronous IPC. Transfer the picker data by value.
            callback(JSON.stringify(result));
        } catch (error) {
            this.logger.error(`Could not list note link targets. Cause: ${error}`, 'CollectionService', 'getNoteLinkTargetsEventHandler');
            const result: NoteLinkTargetsResult = { operation: Operation.Error, notes: [] };
            callback(JSON.stringify(result));
        }
    }

    private async openLinkedNoteEventHandler(noteId: string, callback: (operation: Operation) => void): Promise<void> {
        try {
            if (this.initialization || this.collectionChangeInProgress || this.movingNoteIds.has(noteId)) {
                this.logger.warn('Cannot follow a note link while its collection or note is changing.',
                    'CollectionService', 'openLinkedNoteEventHandler');
                callback(Operation.Aborted);
                return;
            }
            const note = /^[A-Za-z0-9_-]+$/.test(noteId) ? this.collectionDataStoreAccess.getNoteById(noteId) : undefined;
            if (!note || note.isTrashed) {
                this.logger.warn(`Linked note is unavailable: ${noteId}`, 'CollectionService', 'openLinkedNoteEventHandler');
                callback(Operation.Blank);
                return;
            }
            if (this.noteIsOpen(noteId)) {
                this.onFocusNote(noteId);
            } else {
                await this.setNoteOpenAsync(noteId, true);
            }
            callback(Operation.Success);
        } catch (error) {
            this.logger.error(`Could not open linked note. Cause: ${error}`, 'CollectionService', 'openLinkedNoteEventHandler');
            callback(Operation.Error);
        }
    }

    public async setNoteOpenAsync(noteId: string, isOpen: boolean): Promise<void> {
        if (isOpen) {
            if (this.initialization || this.collectionChangeInProgress || this.movingNoteIds.has(noteId)) {
                this.logger.warn('Cannot open a note while its collection is changing or the note is being moved.',
                    'CollectionService', 'setNoteOpenAsync');
                return;
            }
            if (!this.openNoteIds.includes(noteId)) {
                this.openNoteIds.push(noteId);

                try {
                    const activeCollectionDirectoryPath: string = await this.collectionFileAccess.getCollectionDirectoryPath(
                        this.settings.activeCollection,
                    );
                    this.logger.info(
                        `Active collection directory=${activeCollectionDirectoryPath}`,
                        'CollectionService',
                        'importNoteFilesAsync',
                    );
                    const arg = {
                        notePath: activeCollectionDirectoryPath,
                        noteId: noteId,
                        windowHasFrame: this.appearance.windowHasNativeTitleBar,
                    };
                    ipcRenderer.send('open-note-window', arg);
                } catch (error) {
                    this.openNoteIds = this.openNoteIds.filter((id) => id !== noteId);
                    throw error;
                }
            }
        } else {
            if (this.openNoteIds.includes(noteId)) {
                this.openNoteIds.splice(this.openNoteIds.indexOf(noteId), 1);
            }

            const note: Note = this.collectionDataStoreAccess.getNoteById(noteId);

            // TODO: we'd better split up setNoteOpenAsync into 2 functions.
            try {
                if (!note.isEncrypted) {
                    await this.collectionFileAccess.deleteUnusedNoteAttachmentsAsync(noteId, this.settings.activeCollection, note.text);
                }
            } catch (error) {
                this.logger.error(
                    `Could not delete unused note attachments of note with id='${noteId}'. Cause: ${error}`,
                    'CollectionService',
                    'setNoteOpenAsync',
                );
            }
        }
    }

    private getUniqueNoteTitle(
        baseTitle: string,
        isNewNote: boolean,
        dataStore: CollectionDataStoreAccess = this.collectionDataStoreAccess,
    ): string {
        let counter: number = 0;
        let uniqueTitle: string = baseTitle;

        if (isNewNote) {
            counter = 1;
            uniqueTitle = `${baseTitle} ${counter}`;
        }

        const notesWithIdenticalBaseTitle: Note[] = dataStore.getNotesWithIdenticalBaseTitle(baseTitle);
        const similarTitles: string[] = notesWithIdenticalBaseTitle.map((x) => x.title);

        while (similarTitles.includes(uniqueTitle)) {
            counter++;
            uniqueTitle = `${baseTitle} (${counter})`;
        }

        return uniqueTitle;
    }

    private notebookExists(notebookName: string): boolean {
        const notebook: Notebook = this.collectionDataStoreAccess.getNotebookByName(notebookName);

        return notebook != undefined;
    }

    private getVisibleNotes(notes: Note[]): Note[] {
        if (this.settings.showArchivedNotebooks) {
            return notes;
        }

        const archivedNotebookIds = new Set(
            this.collectionDataStoreAccess.getNotebooks().filter((notebook) => notebook.isArchived).map((notebook) => notebook.id),
        );
        return notes.filter((note) => !archivedNotebookIds.has(note.notebookId));
    }

    private getFilteredNotes(unfilteredNotes: Note[], filter: string): Note[] {
        // When there is no filter, return the original collection.
        if (!filter || filter.trim().length === 0) {
            return unfilteredNotes;
        }

        const search = TagUtils.parseSearch(filter);
        const searchTextPieces: string[] = search.text.split(/\s+/);
        const tagPatterns: RegExp[] = search.tags.map((searchTag) => {
            const pattern: string = searchTag
                .split('*')
                .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('.*');
            return new RegExp(`^${pattern}$`, 'i');
        });

        return unfilteredNotes.filter((note) => {
            const matchesTag: boolean = tagPatterns.every((tagPattern) =>
                (note.tags || []).some((tag) => tag.length > 0 && tagPattern.test(tag)));
            return matchesTag && CollectionUtils.containsAll(`${note.title} ${note.text}`, searchTextPieces);
        });
    }

    public encryptNoteEventHandler(noteId: string, secretKey: string): void {
        const secretKeyHash: string = this.cryptography.createHash(secretKey);
        this.collectionDataStoreAccess.encryptNote(noteId, secretKeyHash);
        this.changeVersion++;
    }

    public decryptNoteEventHandler(noteId: string): void {
        this.collectionDataStoreAccess.decryptNote(noteId);
        this.changeVersion++;
    }

    private async getIsInitializedEventHandler(callback: any): Promise<void> {
        callback(this.isInitialized);
    }

    public onCloseNote(noteId: string): void {
        this.globalEmitter.emit(CollectionEvents.closeNoteEvent, noteId);
    }

    public onFocusNote(noteId: string): void {
        this.globalEmitter.emit(CollectionEvents.focusNoteEvent, noteId);
    }

    public onNoteZoomPercentageChanged(): void {
        this.globalEmitter.emit(CollectionEvents.noteZoomPercentageChangedEvent);
    }

    public onNotebookChanged(noteId: string, notebookName: string): void {
        this.globalEmitter.emit(CollectionEvents.notebookChangedEvent, new NotebookChangedResult(noteId, notebookName));
    }

    public onCloseAllNotes(): void {
        this.globalEmitter.emit(CollectionEvents.closeAllNotesEvent);
    }

    private onNoteMarkChanged(noteId: string, isMarked: boolean): void {
        const result: NoteMarkResult = new NoteMarkResult(noteId, isMarked, 0);
        this.globalEmitter.emit(CollectionEvents.noteMarkChangedEvent, result);
    }

    private onNotePinChanged(noteId: string, isPinned: boolean): void {
        const result: NotePinResult = new NotePinResult(noteId, isPinned);
        this.globalEmitter.emit(CollectionEvents.notePinChangedEvent, result);
    }
}
