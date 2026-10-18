import { Injectable } from '@angular/core';
import { FileAccess } from '../../common/io/file-access';
import { Logger } from '../../common/logging/logger';
import { DataStore } from '../../data/data-store';
import { DataStoreFactory } from '../../data/data-store-factory';
import { Note } from '../../data/entities/note';
import { Notebook } from '../../data/entities/notebook';
import { CollectionPathConverter } from './collection-path-converter';
import { markCollectionChangedAsync } from './collection-revision-marker';

@Injectable()
export class CollectionDataStoreAccess {
    private collectionName: string = '';
    // Tracks whether a data-store mutation is pending since the last save, so that saveAsync()
    // only bumps the collection's revision marker for genuine changes, not for the repeated
    // flush-only saves the backup checkpoint mechanism performs while checking directory
    // stability (which would otherwise make the collection look like it never stops changing).
    private hasPendingChanges: boolean = false;

    public constructor(
        private collectionPathConverter: CollectionPathConverter,
        private fileAccess: FileAccess,
        private dataStore: DataStore,
        private logger: Logger,
        private dataStoreFactory: DataStoreFactory
    ) {}

    public async initializeAsync(collection: string): Promise<void> {
        const databaseFilePath: string = this.getCollectionDatabasePath(collection);
        await this.dataStore.initializeAsync(databaseFilePath);
        this.collectionName = collection;
        this.logger.info(`Initialized data store: ${databaseFilePath}`, 'CollectionDataStoreAccess', 'initializeAsync');
    }

    public async openCollectionAsync(collection: string): Promise<CollectionDataStoreAccess> {
        const store = await this.dataStoreFactory.openAsync(this.getCollectionDatabasePath(collection));
        const collectionDataStoreAccess = new CollectionDataStoreAccess(
            this.collectionPathConverter,
            this.fileAccess,
            store,
            this.logger,
            this.dataStoreFactory
        );
        collectionDataStoreAccess.collectionName = collection;
        return collectionDataStoreAccess;
    }

    public async saveAsync(): Promise<void> {
        // Mark the collection as changed before persisting the database, so that automatic
        // backups never miss a genuine mutation even if the app is interrupted part-way through.
        // Only do this when a mutation is actually pending: saveAsync() is also invoked as a
        // plain flush (for example during backup checkpoints), and marking unconditionally would
        // make the collection appear to change on every checkpoint.
        if (this.collectionName && this.hasPendingChanges) {
            await markCollectionChangedAsync(
                this.fileAccess,
                this.collectionPathConverter.getCollectionDirectoryPathFromCollectionName(this.collectionName)
            );
            this.hasPendingChanges = false;
        }

        await this.dataStore.saveAsync();
    }

    private getCollectionDatabasePath(collection: string): string {
        return this.fileAccess.combinePath(
            this.collectionPathConverter.getCollectionDirectoryPathFromCollectionName(collection),
            `${collection}.db`
        );
    }

    public getNotebooks(): Notebook[] {
        return this.dataStore.getNotebooks();
    }

    public addNotebookIfDoesNotExist(notebookName: string): boolean {
        // Check if there is already a notebook with that name
        if (this.notebookExists(notebookName)) {
            this.logger.info(
                `Not adding notebook '${notebookName}' to the data store because it already exists`,
                'CollectionDataStoreAccess',
                'addNotebookIfDoesNotExist'
            );
            return false;
        }

        // Add the notebook to the data store
        this.hasPendingChanges = true;
        this.dataStore.addNotebook(notebookName);
        this.logger.info(`Added notebook '${notebookName}' to the data store`, 'CollectionDataStoreAccess', 'addNotebookIfDoesNotExist');

        return true;
    }

    private notebookExists(notebookName: string): boolean {
        const notebook: Notebook = this.dataStore.getNotebookByName(notebookName);

        return notebook != undefined;
    }

    public addNotebook(notebookName: string): string {
        this.hasPendingChanges = true;
        return this.dataStore.addNotebook(notebookName);
    }

    public getNotebookById(notebookId: string): Notebook {
        return this.dataStore.getNotebookById(notebookId);
    }

    public updateNotebook(notebook: Notebook, save: boolean = true): void {
        this.hasPendingChanges = true;
        this.dataStore.updateNotebook(notebook, save);
    }

    public deleteNotebook(notebookId: string): void {
        this.hasPendingChanges = true;
        this.dataStore.deleteNotebook(notebookId);
    }

    public getNoteById(noteId: string): Note {
        return this.dataStore.getNoteById(noteId);
    }

    public deleteNote(noteId: string): void {
        this.hasPendingChanges = true;
        this.dataStore.deleteNote(noteId);
    }

    public trashNote(noteId: string): void {
        this.hasPendingChanges = true;
        this.dataStore.trashNote(noteId);
    }

    public restoreNote(noteId: string): void {
        this.hasPendingChanges = true;
        this.dataStore.restoreNote(noteId);
    }

    public getNotes(): Note[] {
        return this.dataStore.getNotes();
    }

    public getUnfiledNotes(): Note[] {
        return this.dataStore.getUnfiledNotes();
    }

    public getNotebookNotes(notebookId: string): Note[] {
        return this.dataStore.getNotebookNotes(notebookId);
    }

    public updateNote(note: Note): void {
        this.hasPendingChanges = true;
        this.dataStore.updateNote(note);
    }

    public getNoteByTitle(noteTitle: string): Note {
        return this.dataStore.getNoteByTitle(noteTitle);
    }

    public updateNoteWithoutDate(note: Note): void {
        this.hasPendingChanges = true;
        this.dataStore.updateNoteWithoutDate(note);
    }

    public getNotesWithIdenticalBaseTitle(baseTitle: string): Note[] {
        return this.dataStore.getNotesWithIdenticalBaseTitle(baseTitle);
    }

    public getNotebookByName(notebookName: string): Notebook {
        return this.dataStore.getNotebookByName(notebookName);
    }

    public getTrashedNotes(): Note[] {
        return this.dataStore.getTrashedNotes();
    }

    public addNote(uniqueNoteTitle: string, notebookId: string, isMarkdownNote: boolean): string {
        this.hasPendingChanges = true;
        return this.dataStore.addNote(uniqueNoteTitle, notebookId, isMarkdownNote);
    }

    public getMarkedNotes(): Note[] {
        return this.dataStore.getMarkedNotes();
    }

    public encryptNote(noteId: string, secretKeyHash: string): void {
        this.hasPendingChanges = true;
        this.dataStore.encryptNote(noteId, secretKeyHash);
    }

    public decryptNote(noteId: string): void {
        this.hasPendingChanges = true;
        this.dataStore.decryptNote(noteId);
    }
}
