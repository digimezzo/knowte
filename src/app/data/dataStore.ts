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
    private collections: any;
    private notebooks: any;
    private notes: any;

    public isReady: boolean = false;

    private databaseLoaded(): void {
        let mustSaveDatabase: boolean = false;

        this.collections = this.db.getCollection('collections');

        if (!this.collections) {
            this.collections = this.db.addCollection('collections');
            this.collections.insert(new Collection(Constants.defaultCollectionName, true));
            mustSaveDatabase = true;
        }

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

        this.isReady = true;
    }

    public initialize(storageDirectory: string): void {
        this.db = new loki(path.join(storageDirectory, Constants.dataStoreFile), {
            autoload: true,
            autoloadCallback: this.databaseLoaded.bind(this)
        });
    }

    public getCollections(): Collection[] {
        return this.collections.chain().sort(Utils.caseInsensitiveNameSort).data();
    }

    public getCollectionById(id: string): Collection {
        return this.collections.findOne({ 'id': id });
    }

    public getCollectionByName(name: string): Collection {
        return this.collections.findOne({ 'name': name });
    }

    public addCollection(name: string, isActive: boolean) {
        let newCollection: Collection = new Collection(name, isActive);
        this.notebooks.insert(newCollection);
        this.db.saveDatabase();

        return newCollection.id;
    }

    public updateCollection(collection: Collection): void {
        this.collections.update(collection);
        this.db.saveDatabase();
    }

    public activateCollection(id: string): void {
        // Deactivate all collections
        let collections: Collection[] = this.collections.find();

        collections.forEach(x => {
            x.isActive = false;
            this.collections.update(x);
        });

        // Activate the selected collection
        let collectionToActivate: Collection = this.getCollectionById(id);
        collectionToActivate.isActive = true;
        this.collections.update(collectionToActivate);

        // Persist
        this.db.saveDatabase();
    }

    public deleteCollection(id: string) {
        // Delete collection
        let collectionToDelete: Collection = this.getCollectionById(id);
        this.collections.remove(collectionToDelete);

        // Delete Notebooks
        let notebooksToDelete: Notebook[] = this.notebooks.find({ 'collectionId': id });
        notebooksToDelete.forEach(x => this.notebooks.remove(x));

        // Delete Notes
        let notesToDelete: Note[] = this.notes.find({ 'collectionId': id });
        notesToDelete.forEach(x => this.notes.remove(x));

        // Persist
        this.db.saveDatabase();
    }

    public getActiveCollection(): Collection {
        let activeCollection: Collection = this.collections.findOne({ 'isActive': true });

        return activeCollection;
    }

    public getNotebooks(collectionId: string): Notebook[] {
        let notebooks: Notebook[] = this.notebooks.chain().find({ 'collectionId': collectionId }).sort(Utils.caseInsensitiveNameSort).data();

        return notebooks;
    }

    public getNotebookById(id: string): Notebook {
        return this.notebooks.findOne({ 'id': id });
    }

    public getNotebookByName(collectionId: string, name: string): Notebook {
        return this.notebooks.findOne({ '$and': [{ 'collectionId': collectionId }, { 'name': name }] });
    }

    public addNotebook(collectionId: string, name: string): string {
        let newNotebook: Notebook = new Notebook(name, collectionId);
        this.notebooks.insert(newNotebook);
        this.db.saveDatabase();

        return newNotebook.id;
    }

    public deleteNotebook(id: string) {
        let notebookToDelete: Notebook = this.getNotebookById(id);
        this.notebooks.remove(notebookToDelete);
        this.db.saveDatabase();
    }

    public getNotes(collectionId: string): Note[] {
        let notes: Note[] = this.notes.chain().find({ 'collectionId': collectionId }).simplesort('modificationDate', true).data();

        return notes;
    }

    public getUnfiledNotes(collectionId: string): Note[] {
        let notebookIds: string[] = this.notebooks.chain().data().map(x => x.id);

        let notes: Note[] = this.notes.chain().where(function (obj) {
            return obj.collectionId === collectionId && (obj.notebookId === "" || !notebookIds.includes(obj.notebookId));
        }).simplesort('modificationDate', true).data();

        return notes;
    }

    public getMarkedNotes(collectionId: string): Note[] {
        let notes: Note[] = this.notes.chain().find({ '$and': [{ 'collectionId': collectionId }, { 'isMarked': true }] }).simplesort('modificationDate', true).data();

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

    public addNote(title: string, notebookId: string, collectionId: string): string {
        let newNote: Note = new Note(title, notebookId, collectionId);
        this.notes.insert(newNote);
        this.db.saveDatabase();

        return newNote.id;
    }

    public getNoteById(id: string): Note {
        let note: Note = this.notes.findOne({ 'id': id });

        return note;
    }

    public getNoteByTitle(collectionId: string, noteTitle: string): Notebook {
        return this.notes.findOne({ '$and': [{ 'collectionId': collectionId }, { 'title': noteTitle }] });
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
