import * as Store from 'electron-store';
import * as loki from 'lokijs';
import * as path from 'path';
import { Constants } from '../core/constants';
import { Collection } from './entities/collection';
import { Notebook } from './entities/notebook';
import { Note } from './entities/note';
import * as moment from 'moment'
import { Utils } from '../core/utils';

export class DataStore {
    private settings: Store = new Store();

    constructor() {
    }

    private db: loki;
    private notebooks: any;
    private notes: any;

    private isLoaded: boolean = false;
    private databaseFile: string;

    private databaseLoaded(): void {
        let mustSaveDatabase: boolean = false;
        
        this.notebooks = this.db.getCollection('notebooks');

        if (!this.notebooks) {
            this.notebooks = this.db.addCollection('notebooks');
            mustSaveDatabase = true;
        }

        this.notes = this.db.getCollection('notes');

        if (!this.notes) {
            this.notes = this.db.addCollection('notes');
            mustSaveDatabase = true;
        }

        if (mustSaveDatabase) {
            this.db.saveDatabase();
        }

        this.isLoaded = true;
    }

    private loadDatabase(databaseFile: string): void {
        this.isLoaded = false;
        this.databaseFile = databaseFile;

        this.db = new loki(databaseFile, {
            autoload: true,
            autoloadCallback: this.databaseLoaded.bind(this)
        });
    }

    public async initializeAsync(databaseFile: string) {
        if (this.databaseFile && this.databaseFile === databaseFile && this.isLoaded) {
            // This database file is already loaded
            return;
        }

        this.loadDatabase(databaseFile);

        while (!this.isLoaded) {
            await Utils.sleep(100);
        }
    }

    public getNotebooks(): Notebook[] {
        let notebooks: Notebook[] = this.notebooks.chain().sort(Utils.caseInsensitiveNameSort).data();

        return notebooks;
    }

    public getNotebookById(id: string): Notebook {
        return this.notebooks.findOne({ 'id': id });
    }

    public getNotebookByName(name: string): Notebook {
        return this.notebooks.findOne({ 'name': name });
    }

    public addNotebook(name: string): string {
        let newNotebook: Notebook = new Notebook(name);
        this.notebooks.insert(newNotebook);
        this.db.saveDatabase();

        return newNotebook.id;
    }

    public deleteNotebook(id: string) {
        let notebookToDelete: Notebook = this.getNotebookById(id);
        this.notebooks.remove(notebookToDelete);
        this.db.saveDatabase();
    }

    public getNotes(): Note[] {
        let notes: Note[] = this.notes.chain().simplesort('modificationDate', true).data();

        return notes;
    }

    public getUnfiledNotes(): Note[] {
        let notebookIds: string[] = this.notebooks.chain().data().map(x => x.id);

        let notes: Note[] = this.notes.chain().where(function (obj) {
            return obj.notebookId === "" || !notebookIds.includes(obj.notebookId);
        }).simplesort('modificationDate', true).data();

        return notes;
    }

    public getMarkedNotes(): Note[] {
        let notes: Note[] = this.notes.chain().find({ 'isMarked': true }).simplesort('modificationDate', true).data();

        return notes;
    }

    public getNotebookNotes(notebookId: string): Note[] {
        let notes: Note[] = this.notes.chain().find({ 'notebookId': notebookId }).simplesort('modificationDate', true).data();

        return notes;
    }

    public getNotesWithIdenticalBaseTitle(baseTitle: string): Note[] {
        let notesWithIdenticalBaseTitle: Note[] = this.notes.chain().where(function (obj) {
            return obj.title.startsWith(baseTitle);
        }).data();

        return notesWithIdenticalBaseTitle;
    }

    public addNote(title: string, notebookId: string): string {
        let newNote: Note = new Note(title, notebookId);
        this.notes.insert(newNote);
        this.db.saveDatabase();

        return newNote.id;
    }

    public getNoteById(id: string): Note {
        let note: Note = this.notes.findOne({ 'id': id });

        return note;
    }

    public getNoteByTitle(noteTitle: string): Note {
        return this.notes.findOne({ 'title': noteTitle });
    }

    public deleteNote(id: string) {
        let noteToDelete: Note = this.getNoteById(id);
        this.notes.remove(noteToDelete);
        this.db.saveDatabase();
    }

    public updateNote(note: Note): void {
        this.notes.update(note);
        note.modificationDate = moment().valueOf();
        this.db.saveDatabase();
    }

    public updateNotebook(notebook: Notebook): void {
        this.notebooks.update(notebook);
        this.db.saveDatabase();
    }

    public getOpenNotes(): Note[] {
        let notes: Note[] = this.notes.chain().find({ 'isOpen': true }).data();

        return notes;
    }

    public closeAllNotes(): void {
        let openNotes: Note[] = this.notes.chain().find({ 'isOpen': true }).data();

        for (let openNote of openNotes) {
            openNote.isOpen = false;
            this.notes.update(openNote);
        }

        this.db.saveDatabase();
    }
}
