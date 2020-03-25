import * as loki from 'lokijs';
import { Notebook } from './entities/notebook';
import { Note } from './entities/note';
import * as moment from 'moment';
import { Utils } from '../core/utils';

export class DataStore {
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

    public async initializeAsync(databaseFile: string): Promise<void> {
        this.loadDatabase(databaseFile);

        while (!this.isLoaded) {
            await Utils.sleep(100);
        }
    }

    public getNotebooks(): Notebook[] {
        const notebooks: Notebook[] = this.notebooks.chain().sort(Utils.caseInsensitiveNameSort).data();

        return notebooks;
    }

    public getNotebookById(id: string): Notebook {
        return this.notebooks.findOne({ 'id': id });
    }

    public getNotebookByName(name: string): Notebook {
        return this.notebooks.findOne({ 'name': name });
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
        const notes: Note[] = this.notes.chain().simplesort('modificationDate', true).data();

        return notes;
    }

    public getUnfiledNotes(): Note[] {
        const notebookIds: string[] = this.notebooks.chain().data().map(x => x.id);

        const notes: Note[] = this.notes.chain().where((obj) => {
            return obj.notebookId === '' || !notebookIds.includes(obj.notebookId);
        }).simplesort('modificationDate', true).data();

        return notes;
    }

    public getMarkedNotes(): Note[] {
        const notes: Note[] = this.notes.chain().find({ 'isMarked': true }).simplesort('modificationDate', true).data();

        return notes;
    }

    public getNotebookNotes(notebookId: string): Note[] {
        const notes: Note[] = this.notes.chain().find({ 'notebookId': notebookId }).simplesort('modificationDate', true).data();

        return notes;
    }

    public getNotesWithIdenticalBaseTitle(baseTitle: string): Note[] {
        const notesWithIdenticalBaseTitle: Note[] = this.notes.chain().where((obj) => {
            return obj.title.startsWith(baseTitle);
        }).data();

        return notesWithIdenticalBaseTitle;
    }

    public addNote(title: string, notebookId: string): string {
        const newNote: Note = new Note(title, notebookId);
        this.notes.insert(newNote);
        this.db.saveDatabase();

        return newNote.id;
    }

    public getNoteById(id: string): Note {
        const note: Note = this.notes.findOne({ 'id': id });

        return note;
    }

    public getNoteByTitle(noteTitle: string): Note {
        return this.notes.findOne({ 'title': noteTitle });
    }

    public deleteNote(id: string): void {
        const noteToDelete: Note = this.getNoteById(id);
        this.notes.remove(noteToDelete);
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
