import { Injectable } from '@angular/core';
import * as Store from 'electron-store';
import * as loki from 'lokijs';
import * as path from 'path';
import { Constants } from '../core/constants';
import { Collection } from './collection';
import * as nanoid from 'nanoid';
import { Notebook } from './notebook';
import { Note } from './note';
import * as moment from 'moment'

@Injectable({
    providedIn: 'root',
})
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
            this.collections.insert(new Collection(Constants.defaultCollectionName, nanoid(), true));
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

    private caseInsensitiveNameSort(object1: any, object2: any) {
        return object1.name.toLowerCase().localeCompare(object2.name.toLowerCase());
    }

    public getAllCollections(): Collection[] {
        return this.collections.chain().sort(this.caseInsensitiveNameSort).data();
    }

    public getCollection(collectionId: string): Collection {
        return this.collections.findOne({ 'id': collectionId });
    }

    public getCollectionByName(collectionName: string): Collection {
        return this.collections.findOne({ 'name': collectionName });
    }

    public addCollection(collectionName: string, isActive: boolean) {
        let collectionId: string = nanoid();
        this.collections.insert(new Collection(collectionName, collectionId, isActive));
        this.db.saveDatabase();

        return collectionId;
    }

    public setCollectionName(collectionId: string, collectionName: string) {
        let collectionToRename: Collection = this.getCollection(collectionId);
        collectionToRename.name = collectionName;
        this.collections.update(collectionToRename);
        this.db.saveDatabase();
    }

    public activateCollection(collectionId: string): void {
        // Deactivate all collections
        let collections: Collection[] = this.collections.find();

        collections.forEach(x => {
            x.isActive = false;
            this.collections.update(x);
        });

        // Activate the selected collection
        let collectionToActivate: Collection = this.getCollection(collectionId);
        collectionToActivate.isActive = true;
        this.collections.update(collectionToActivate);

        // Persist
        this.db.saveDatabase();
    }

    public deleteCollection(collectionId: string) {
        // Remove collection
        let collectionToRemove: Collection = this.getCollection(collectionId);
        this.collections.remove(collectionToRemove);

        // Remove Notebooks
        let notebooksToRemove: Notebook[] = this.notebooks.find({ 'collectionId': collectionId });
        notebooksToRemove.forEach(x => this.notebooks.remove(x));

        // Remove Notes
        let notesToRemove: Note[] = this.notes.find({ 'collectionId': collectionId });
        notesToRemove.forEach(x => this.notes.remove(x));

        // Persist
        this.db.saveDatabase();
    }

    public getActiveCollection(): Collection {
        let activeCollection: Collection = this.collections.findOne({ 'isActive': true });

        return activeCollection;
    }

    public getNotebookByName(collectionId: string, notebookName: string): Notebook {
        return this.notebooks.findOne({ '$and': [{ 'collectionId': collectionId }, { 'name': notebookName }] });
    }

    public addNotebook(collectionId: string, notebookName: string): string {
        let newNotebook: Notebook = new Notebook(notebookName, collectionId);
        this.notebooks.insert(newNotebook);
        this.db.saveDatabase();

        return newNotebook.id;
    }

    public getNotebooks(collectionId: string): Notebook[] {
        let notebooks: Notebook[] = this.notebooks.chain().find({ 'collectionId': collectionId }).sort(this.caseInsensitiveNameSort).data();

        return notebooks;
    }

    public getNotebook(notebookId: string): Notebook {
        return this.notebooks.findOne({ 'id': notebookId });
    }

    public setNotebookName(notebookId: string, notebookName: string) {
        let notebookToRename: Notebook = this.getNotebook(notebookId);
        notebookToRename.name = notebookName;
        this.notebooks.update(notebookToRename);
        this.db.saveDatabase();
    }

    public deleteNotebook(notebookId: string) {
        // Remove notebook
        let notebookToRemove: Notebook = this.getNotebook(notebookId);
        this.notebooks.remove(notebookToRemove);

        // Persist
        this.db.saveDatabase();
    }

    public getAllNotes(collectionId: string): Note[] {
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

    public getNotes(notebookId: string): Note[] {
        let notes: Note[] = this.notes.chain().find({ 'notebookId': notebookId }).simplesort('modificationDate', true).data();

        return notes;
    }

    public getNotesWithIdenticalBaseTitle(baseTitle: string): Note[] {
        let notesWithIdenticalBaseTitle: Note[] = this.notes.chain().where(function (obj) {
            return obj.title.startsWith(baseTitle);
        }).data();

        return notesWithIdenticalBaseTitle;
    }

    public addNote(noteTitle: string, notebookId: string, collectionId: string): string {
        let newNote: Note = new Note(noteTitle, notebookId, collectionId);
        this.notes.insert(newNote);
        this.db.saveDatabase();

        return newNote.id;
    }

    public getNote(noteId: string): Note {
        let note: Note = this.notes.findOne({ 'id': noteId });

        return note;
    }

    public getNoteByTitle(collectionId: string, noteTitle: string): Notebook {
        return this.notes.findOne({ '$and': [{ 'collectionId': collectionId }, { 'title': noteTitle }] });
    }

    public deleteNote(noteId: string) {
        let noteToRemove: Note = this.getNote(noteId);
        this.notes.remove(noteToRemove);
        this.db.saveDatabase();
    }

    public updateNote(note: Note): string {
        this.notes.update(note);
        note.modificationDate = moment().valueOf();
        this.db.saveDatabase();

        return note.id;
    }

    public setNoteIsOpen(noteId: string, isOpen: boolean): void {
        let note: Note = this.notes.findOne({ 'id': noteId });
        note.isOpen = isOpen;
        this.notes.update(note);
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
