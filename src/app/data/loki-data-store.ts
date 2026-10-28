import { Injectable } from '@angular/core';
import loki from 'lokijs';
import moment from 'moment';
import { Logger } from '../common/logging/logger';
import { PerformanceDiagnostics } from '../common/logging/performance-diagnostics';
import { DataStore } from './data-store';
import { Note } from './entities/note';
import { Notebook } from './entities/notebook';

@Injectable()
export class LokiDataStore extends DataStore {
    private db: loki;
    private loadedNotebooks: any;
    private loadedNotes: any;
    private isLoaded: boolean = false;
    private initialization: Promise<void> | undefined;
    private initializingDatabaseFile: string;
    private readonly logger: Logger = new Logger();

    private get notebooks(): any {
        this.ensureLoaded();
        return this.loadedNotebooks;
    }

    private get notes(): any {
        this.ensureLoaded();
        return this.loadedNotes;
    }

    private ensureLoaded(): void {
        if (!this.isLoaded) {
            throw new Error('Data store is not initialized. Await initializeAsync before accessing it.');
        }
    }

    public caseInsensitiveNameSort(object1: any, object2: any): any {
        return object1.name.toLowerCase().localeCompare(object2.name.toLowerCase());
    }

    public async initializeAsync(databaseFile: string): Promise<void> {
        if (this.initialization) {
            if (this.initializingDatabaseFile !== databaseFile) {
                throw new Error('Cannot switch databases while data store initialization is in progress.');
            }
            return this.initialization;
        }

        this.isLoaded = false;
        this.initializingDatabaseFile = databaseFile;
        this.initialization = PerformanceDiagnostics.measureAsync('Database.load', () => this.loadDatabaseAsync(databaseFile), true);
        try {
            await this.initialization;
        } finally {
            this.initialization = undefined;
        }
    }

    private async loadDatabaseAsync(databaseFile: string): Promise<void> {
        const database = new loki(databaseFile);
        await new Promise<void>((resolve, reject) => {
            database.loadDatabase({}, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        const existingNotebooks = database.getCollection('notebooks');
        const existingNotes = database.getCollection('notes');
        const notebooks = existingNotebooks || database.addCollection('notebooks');
        const notes = existingNotes || database.addCollection('notes');

        if (!existingNotebooks || !existingNotes) {
            await new Promise<void>((resolve, reject) => {
                this.saveDatabase(database, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        }

        this.db = database;
        this.loadedNotebooks = notebooks;
        this.loadedNotes = notes;
        this.isLoaded = true;
    }

    public async saveAsync(): Promise<void> {
        this.ensureLoaded();
        await new Promise<void>((resolve, reject) => {
            this.saveDatabase(this.db, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private saveDatabase(database: loki, callback?: (error?: Error) => void): void {
        const finish = PerformanceDiagnostics.start('Database.save', true);
        const finishCall = PerformanceDiagnostics.start('Database.save synchronous call');
        try {
            database.saveDatabase((error) => {
                finish(error ? 'failed' : 'callback received');
                if (error) {
                    this.logger.error(`Database save failed: ${error}`, 'LokiDataStore', 'saveDatabase');
                }
                callback?.(error);
            });
        } catch (error) {
            finish('threw');
            this.logger.error(`Database save threw: ${error}`, 'LokiDataStore', 'saveDatabase');
            throw error;
        } finally {
            finishCall();
        }
    }

    public getNotebooks(): Notebook[] {
        return PerformanceDiagnostics.measure('Database.getNotebooks',
            () => this.notebooks.chain().sort(this.caseInsensitiveNameSort).data());
    }

    public getNotebookById(id: string): Notebook {
        return PerformanceDiagnostics.measure('Database.getNotebookById', () => this.notebooks.findOne({ id: id }));
    }

    public getNotebookByName(name: string): Notebook {
        return PerformanceDiagnostics.measure('Database.getNotebookByName', () => this.notebooks.findOne({ name: name }));
    }

    public addNotebook(name: string): string {
        const newNotebook: Notebook = new Notebook(name);
        this.notebooks.insert(newNotebook);
        this.saveDatabase(this.db);

        return newNotebook.id;
    }

    public deleteNotebook(id: string): void {
        const notebookToDelete: Notebook = this.getNotebookById(id);
        this.notebooks.remove(notebookToDelete);
        this.saveDatabase(this.db);
    }

    public getNotes(): Note[] {
        return PerformanceDiagnostics.measure('Database.getNotes', () => this.notes
            .chain()
            .where((obj) => {
                return !obj.isTrashed;
            })
            .simplesort('modificationDate', true)
            .data(), true);
    }

    public getTrashedNotes(): Note[] {
        return PerformanceDiagnostics.measure('Database.getTrashedNotes', () => this.notes
            .chain()
            .where((obj) => {
                return obj.isTrashed;
            })
            .simplesort('trashedDate', true)
            .data(), true);
    }

    public getUnfiledNotes(): Note[] {
        return PerformanceDiagnostics.measure('Database.getUnfiledNotes', () => {
            const notebookIds: string[] = this.notebooks
                .chain()
                .data()
                .map((x) => x.id);

            return this.notes
                .chain()
                .where((obj) => {
                    return !obj.isTrashed && (obj.notebookId === '' || !notebookIds.includes(obj.notebookId));
                })
                .simplesort('modificationDate', true)
                .data();
        }, true);
    }

    public getMarkedNotes(): Note[] {
        return PerformanceDiagnostics.measure('Database.getMarkedNotes', () => this.notes
            .chain()
            .find({ isMarked: true })
            .where((obj) => {
                return !obj.isTrashed;
            })
            .simplesort('modificationDate', true)
            .data(), true);
    }

    public getNotebookNotes(notebookId: string): Note[] {
        return PerformanceDiagnostics.measure('Database.getNotebookNotes', () => this.notes
            .chain()
            .find({ notebookId: notebookId })
            .where((obj) => {
                return !obj.isTrashed;
            })
            .simplesort('modificationDate', true)
            .data(), true);
    }

    public getNotesWithIdenticalBaseTitle(baseTitle: string): Note[] {
        return PerformanceDiagnostics.measure('Database.getNotesWithIdenticalBaseTitle', () => this.notes
            .chain()
            .where((obj) => {
                return obj.title.startsWith(baseTitle);
            })
            .data());
    }

    public addNote(title: string, notebookId: string, isMarkdownNote: boolean): string {
        const newNote: Note = new Note(title, notebookId, isMarkdownNote);
        this.notes.insert(newNote);
        this.saveDatabase(this.db);

        return newNote.id;
    }

    public getNoteById(id: string): Note {
        return PerformanceDiagnostics.measure('Database.getNoteById', () => this.notes.findOne({ id: id }));
    }

    public getNoteByTitle(noteTitle: string): Note {
        return PerformanceDiagnostics.measure('Database.getNoteByTitle', () => this.notes.findOne({ title: noteTitle }));
    }

    public deleteNote(id: string): void {
        const noteToDelete: Note = this.getNoteById(id);
        this.notes.remove(noteToDelete);
        this.saveDatabase(this.db);
    }

    public trashNote(id: string): void {
        const noteToTrash: Note = this.getNoteById(id);
        noteToTrash.isTrashed = true;
        noteToTrash.isSelected = false;
        noteToTrash.trashedDate = moment().valueOf();
        this.saveDatabase(this.db);
    }

    public encryptNote(id: string, secretKeyHash: string): void {
        const noteToEncrypt: Note = this.getNoteById(id);
        noteToEncrypt.isEncrypted = true;
        noteToEncrypt.secretKeyHash = secretKeyHash;
        this.saveDatabase(this.db);
    }

    public decryptNote(id: string): void {
        const noteToDecrypt: Note = this.getNoteById(id);
        noteToDecrypt.isEncrypted = false;
        noteToDecrypt.secretKeyHash = '';
        this.saveDatabase(this.db);
    }

    public restoreNote(id: string): void {
        const noteToRestore: Note = this.getNoteById(id);
        noteToRestore.isTrashed = false;
        noteToRestore.isSelected = false;
        noteToRestore.trashedDate = 0;
        this.saveDatabase(this.db);
    }

    public updateNote(note: Note): void {
        this.notes.update(note);
        note.modificationDate = moment().valueOf();
        this.saveDatabase(this.db);
    }

    public updateNoteWithoutDate(note: Note): void {
        this.notes.update(note);
        this.saveDatabase(this.db);
    }

    public updateNotebook(notebook: Notebook, save: boolean = true): void {
        this.notebooks.update(notebook);
        if (save) {
            this.saveDatabase(this.db);
        }
    }
}
