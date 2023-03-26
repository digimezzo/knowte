import { Injectable } from '@angular/core';
import { FileAccess } from '../../core/io/file-access';
import { Logger } from '../../core/logger';
import { DataStore } from '../../data/data-store';
import { Note } from '../../data/entities/note';
import { Notebook } from '../../data/entities/notebook';
import { CollectionPathConverter } from './collection-path-converter';

@Injectable()
export class CollectionDataStoreAccess {
    private dataStore: DataStore = new DataStore();

    public constructor(private collectionPathConverter: CollectionPathConverter, private fileAccess: FileAccess, private logger: Logger) {}

    public async initializeAsync(collection: string): Promise<void> {
        const databaseFilePath: string = this.getCollectionDatabasePath(collection);
        await this.dataStore.initializeAsync(databaseFilePath);
        this.logger.info(`Initialized data store: ${databaseFilePath}`, 'CollectionDataStoreAccess', 'initializeAsync');
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
        this.dataStore.addNotebook(notebookName);
        this.logger.info(`Added notebook '${notebookName}' to the data store`, 'CollectionDataStoreAccess', 'addNotebookIfDoesNotExist');

        return true;
    }

    private notebookExists(notebookName: string): boolean {
        const notebook: Notebook = this.dataStore.getNotebookByName(notebookName);

        return notebook != undefined;
    }

    public addNotebook(notebookName: string): string {
        return this.dataStore.addNotebook(notebookName);
    }

    public getNotebookById(notebookId: string): Notebook {
        return this.dataStore.getNotebookById(notebookId);
    }

    public updateNotebook(notebook: Notebook): void {
        this.dataStore.updateNotebook(notebook);
    }

    public deleteNotebook(notebookId: string): void {
        this.dataStore.deleteNotebook(notebookId);
    }

    public getNoteById(noteId: string): Note {
        return this.dataStore.getNoteById(noteId);
    }

    public deleteNote(noteId: string): void {
        this.dataStore.deleteNote(noteId);
    }

    public trashNote(noteId: string): void {
        this.dataStore.trashNote(noteId);
    }

    public restoreNote(noteId: string): void {
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
        this.dataStore.updateNote(note);
    }

    public getNoteByTitle(noteTitle: string): Note {
        return this.dataStore.getNoteByTitle(noteTitle);
    }

    public updateNoteWithoutDate(note: Note): void {
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
        return this.dataStore.addNote(uniqueNoteTitle, notebookId, isMarkdownNote);
    }

    public getMarkedNotes(): Note[] {
        return this.dataStore.getMarkedNotes();
    }

    public encryptNote(noteId: string, secretKeyHash: string): void {
        this.dataStore.encryptNote(noteId, secretKeyHash);
    }

    public decryptNote(noteId: string): void {
        this.dataStore.decryptNote(noteId);
    }
}
