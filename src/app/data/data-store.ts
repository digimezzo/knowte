import { Injectable } from '@angular/core';
import loki from 'lokijs';
import moment from 'moment';
import { Note } from './entities/note';
import { Notebook } from './entities/notebook';

@Injectable()
export class DataStore {
    private db: loki;
    private loadedNotebooks: any;
    private loadedNotes: any;
    private isLoaded: boolean = false;
    private initialization: Promise<void> | undefined;
    private initializingDatabaseFile: string;

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
        this.initialization = this.loadDatabaseAsync(databaseFile);
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
                database.saveDatabase((error) => {
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
            this.db.saveDatabase((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    public getNotebooks(): Notebook[] {
        const notebooks: Notebook[] = this.notebooks.chain().sort(this.caseInsensitiveNameSort).data();

        return notebooks;
    }

    public getNotebookById(id: string): Notebook {
        return this.notebooks.findOne({ id: id });
    }

    public getNotebookByName(name: string): Notebook {
        return this.notebooks.findOne({ name: name });
    }

    public addNotebook(name: string): string {
        const newNotebook: Notebook = new Notebook(name);
        this.notebooks.insert(newNotebook);
        this.db.saveDatabase();

        return newNotebook.id;
    }

    public deleteNotebook(id: string): void {
        const notebookToDelete: Notebook = this.getNotebookById(id);
        this.notebooks.remove(notebookToDelete);
        this.db.saveDatabase();
    }

    public getNotes(): Note[] {
        const notes: Note[] = this.notes
            .chain()
            .where((obj) => {
                return !obj.isTrashed;
            })
            .simplesort('modificationDate', true)
            .data();

        return notes;
    }

    public getTrashedNotes(): Note[] {
        const notes: Note[] = this.notes
            .chain()
            .where((obj) => {
                return obj.isTrashed;
            })
            .simplesort('trashedDate', true)
            .data();

        return notes;
    }

    public getUnfiledNotes(): Note[] {
        const notebookIds: string[] = this.notebooks
            .chain()
            .data()
            .map((x) => x.id);

        const notes: Note[] = this.notes
            .chain()
            .where((obj) => {
                return !obj.isTrashed && (obj.notebookId === '' || !notebookIds.includes(obj.notebookId));
            })
            .simplesort('modificationDate', true)
            .data();

        return notes;
    }

    public getMarkedNotes(): Note[] {
        const notes: Note[] = this.notes
            .chain()
            .find({ isMarked: true })
            .where((obj) => {
                return !obj.isTrashed;
            })
            .simplesort('modificationDate', true)
            .data();

        return notes;
    }

    public getNotebookNotes(notebookId: string): Note[] {
        const notes: Note[] = this.notes
            .chain()
            .find({ notebookId: notebookId })
            .where((obj) => {
                return !obj.isTrashed;
            })
            .simplesort('modificationDate', true)
            .data();

        return notes;
    }

    public getNotesWithIdenticalBaseTitle(baseTitle: string): Note[] {
        const notesWithIdenticalBaseTitle: Note[] = this.notes
            .chain()
            .where((obj) => {
                return obj.title.startsWith(baseTitle);
            })
            .data();

        return notesWithIdenticalBaseTitle;
    }

    public addNote(title: string, notebookId: string, isMarkdownNote: boolean): string {
        const newNote: Note = new Note(title, notebookId, isMarkdownNote);
        this.notes.insert(newNote);
        this.db.saveDatabase();

        return newNote.id;
    }

    public getNoteById(id: string): Note {
        const note: Note = this.notes.findOne({ id: id });

        return note;
    }

    public getNoteByTitle(noteTitle: string): Note {
        return this.notes.findOne({ title: noteTitle });
    }

    public deleteNote(id: string): void {
        const noteToDelete: Note = this.getNoteById(id);
        this.notes.remove(noteToDelete);
        this.db.saveDatabase();
    }

    public trashNote(id: string): void {
        const noteToTrash: Note = this.getNoteById(id);
        noteToTrash.isTrashed = true;
        noteToTrash.isSelected = false;
        noteToTrash.trashedDate = moment().valueOf();
        this.db.saveDatabase();
    }

    public encryptNote(id: string, secretKeyHash: string): void {
        const noteToEncrypt: Note = this.getNoteById(id);
        noteToEncrypt.isEncrypted = true;
        noteToEncrypt.secretKeyHash = secretKeyHash;
        this.db.saveDatabase();
    }

    public decryptNote(id: string): void {
        const noteToDecrypt: Note = this.getNoteById(id);
        noteToDecrypt.isEncrypted = false;
        noteToDecrypt.secretKeyHash = '';
        this.db.saveDatabase();
    }

    public restoreNote(id: string): void {
        const noteToRestore: Note = this.getNoteById(id);
        noteToRestore.isTrashed = false;
        noteToRestore.isSelected = false;
        noteToRestore.trashedDate = 0;
        this.db.saveDatabase();
    }

    public updateNote(note: Note): void {
        this.notes.update(note);
        note.modificationDate = moment().valueOf();
        this.db.saveDatabase();
    }

    public updateNoteWithoutDate(note: Note): void {
        this.notes.update(note);
        this.db.saveDatabase();
    }

    public updateNotebook(notebook: Notebook): void {
        this.notebooks.update(notebook);
        this.db.saveDatabase();
    }
}
