import { TestBed } from '@angular/core/testing';
import loki from 'lokijs';
import { DataStore } from './data-store';
import { DataStoreFactory } from './data-store-factory';
import { LokiDataStore } from './loki-data-store';

jest.mock('lokijs', () => jest.fn());
jest.mock('nanoid', () => ({ nanoid: () => 'entity-id' }));

describe('LokiDataStore initialization', () => {
    let store: DataStore;
    let database: {
        loadDatabase: jest.Mock;
        saveDatabase: jest.Mock;
        getCollection: jest.Mock;
        addCollection: jest.Mock;
    };
    let load: (error?: Error) => void;
    let save: (error?: Error) => void;
    let collections: Map<string, object>;

    beforeEach(() => {
        collections = new Map();
        database = {
            loadDatabase: jest.fn((_options, callback) => (load = callback)),
            saveDatabase: jest.fn((callback) => (save = callback)),
            getCollection: jest.fn((name) => collections.get(name)),
            addCollection: jest.fn((name) => {
                const collection = {};
                collections.set(name, collection);
                return collection;
            }),
        };
        (loki as jest.Mock).mockReset().mockImplementation(() => database);
        store = new LokiDataStore();
    });

    it('resolves the store contract to one lazy Loki implementation per injector', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: DataStore, useClass: LokiDataStore }],
        });

        const injected = TestBed.inject(DataStore);

        expect(injected).toBeInstanceOf(LokiDataStore);
        expect(injected).toBe(TestBed.inject(DataStore));
        expect(loki).not.toHaveBeenCalled();
    });

    it('rejects synchronous commands before initialization', () => {
        expect(() => store.getNotes()).toThrow('Data store is not initialized');
        expect(() => store.getNotebooks()).toThrow('Data store is not initialized');
        expect(() => store.addNote('Title', '', true)).toThrow('Data store is not initialized');
        expect(() => store.addNotebook('Notebook')).toThrow('Data store is not initialized');
    });

    it('waits for loading and the initial save before becoming ready', async () => {
        const completed = jest.fn();
        const initialization = store.initializeAsync('collection.db').then(completed);

        expect(database.loadDatabase).toHaveBeenCalledTimes(1);
        expect(database.addCollection).not.toHaveBeenCalled();
        expect(completed).not.toHaveBeenCalled();
        load();
        await Promise.resolve();

        expect(database.addCollection.mock.calls).toEqual([['notebooks'], ['notes']]);
        expect(database.saveDatabase).toHaveBeenCalledTimes(1);
        expect(completed).not.toHaveBeenCalled();
        expect(() => store.getNotes()).toThrow('Data store is not initialized');

        save();
        await initialization;
        expect(completed).toHaveBeenCalledTimes(1);
        const findOne = jest.fn().mockReturnValue({ id: 'note' });
        Object.assign(collections.get('notes'), { findOne });
        expect(store.getNoteById('note')).toEqual({ id: 'note' });
    });

    it('uses existing collections without an initial save', async () => {
        const note = { id: 'note' };
        collections.set('notebooks', { findOne: () => ({ id: 'notebook' }) });
        collections.set('notes', { findOne: () => note });
        const initialization = store.initializeAsync('existing.db');
        load();
        await initialization;

        expect(database.addCollection).not.toHaveBeenCalled();
        expect(database.saveDatabase).not.toHaveBeenCalled();
        expect(store.getNoteById('note')).toBe(note);
        expect(store.getNotebookById('notebook')).toEqual({ id: 'notebook' });
    });

    it('rejects load errors for concurrent callers and allows retrying', async () => {
        const error = new Error('Cannot load');
        const first = store.initializeAsync('collection.db');
        const second = store.initializeAsync('collection.db');
        load(error);

        await expect(first).rejects.toBe(error);
        await expect(second).rejects.toBe(error);
        expect(loki).toHaveBeenCalledTimes(1);
        expect(database.addCollection).not.toHaveBeenCalled();
        expect(() => store.getNotes()).toThrow('Data store is not initialized');

        const retry = store.initializeAsync('collection.db');
        load();
        await Promise.resolve();
        save();
        await retry;
        expect(loki).toHaveBeenCalledTimes(2);
    });

    it('rejects initial save errors and remains unavailable', async () => {
        const error = new Error('Cannot save');
        const initialization = store.initializeAsync('collection.db');
        load();
        await Promise.resolve();
        save(error);

        await expect(initialization).rejects.toBe(error);
        expect(() => store.getNotebooks()).toThrow('Data store is not initialized');
    });

    it('returns an initialized store from the factory only after loading and saving', async () => {
        const factory = new DataStoreFactory();
        const completed = jest.fn();
        const opening = factory.openAsync('destination.db').then((opened) => {
            completed();
            return opened;
        });
        expect(completed).not.toHaveBeenCalled();
        load();
        await Promise.resolve();
        expect(completed).not.toHaveBeenCalled();
        save();
        const opened = await opening;
        expect(opened).toBeInstanceOf(DataStore);
        expect(opened).toBeInstanceOf(LokiDataStore);
        Object.assign(collections.get('notes'), { findOne: () => ({ id: 'note' }) });
        expect(opened.getNoteById('note')).toEqual({ id: 'note' });
    });

    it('awaits explicit saves and rejects persistence failures', async () => {
        const initialization = store.initializeAsync('collection.db');
        load();
        await Promise.resolve();
        save();
        await initialization;
        const completed = jest.fn();
        const saving = store.saveAsync().then(completed);
        expect(completed).not.toHaveBeenCalled();
        save();
        await saving;
        expect(completed).toHaveBeenCalledTimes(1);
        const failing = store.saveAsync();
        const error = new Error('Cannot persist');
        save(error);
        await expect(failing).rejects.toBe(error);
    });

    it('rejects overlapping database switches without starting another load', async () => {
        const initialization = store.initializeAsync('first.db');

        await expect(store.initializeAsync('second.db')).rejects.toThrow('Cannot switch databases');
        expect(loki).toHaveBeenCalledTimes(1);
        load();
        await Promise.resolve();
        save();
        await initialization;
    });

    it('preserves CRUD and persistence behavior with real Loki and an in-memory adapter', async () => {
        const Loki = jest.requireActual('lokijs');
        const adapter = new Loki.LokiMemoryAdapter();
        (loki as jest.Mock).mockImplementation((filename) => {
            return new Loki(filename, { adapter });
        });

        await store.initializeAsync('first.db');
        const notebookId = store.addNotebook('Work');
        const noteId = store.addNote('Title', notebookId, true);
        expect(store.getNotebookNotes(notebookId).map((note) => note.id)).toEqual([noteId]);
        expect(store.getUnfiledNotes()).toEqual([]);
        const note = store.getNoteById(noteId);
        note.text = 'Saved text';
        note.isMarked = true;
        store.updateNote(note);
        expect(store.getMarkedNotes().map((marked) => marked.id)).toEqual([noteId]);
        store.trashNote(noteId);
        expect(store.getNotes()).toEqual([]);
        expect(store.getTrashedNotes().map((trashed) => trashed.id)).toEqual([noteId]);
        store.restoreNote(noteId);
        store.encryptNote(noteId, 'hash');
        expect(store.getNoteById(noteId).isEncrypted).toBe(true);
        store.decryptNote(noteId);

        await store.saveAsync();
        const switching = store.initializeAsync('second.db');
        expect(() => store.getNotes()).toThrow('Data store is not initialized');
        await switching;
        expect(store.getNotes()).toEqual([]);
        expect(store.getNotebooks()).toEqual([]);

        await store.initializeAsync('first.db');
        expect(store.getNoteByTitle('Title').text).toBe('Saved text');
        expect(store.getNoteById(noteId).isEncrypted).toBe(false);
        expect(store.getNotebookByName('Work').id).toBe(notebookId);
        store.deleteNotebook(notebookId);
        expect(store.getUnfiledNotes().map((unfiled) => unfiled.id)).toEqual([noteId]);
        store.deleteNote(noteId);
        expect(store.getNotes()).toEqual([]);
        await store.saveAsync();
    });
});
