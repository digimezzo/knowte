import { TestBed } from '@angular/core/testing';
import loki from 'lokijs';
import { DataStore } from './data-store';
import { DataStoreFactory } from './data-store-factory';
import { LokiDataStore } from './loki-data-store';
import { Logger } from '../common/logging/logger';
import { PerformanceDiagnostics } from '../common/logging/performance-diagnostics';

jest.mock('lokijs', () => jest.fn());
jest.mock('nanoid', () => ({ nanoid: () => 'entity-id' }));
jest.mock('../common/logging/logger');

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
        PerformanceDiagnostics.configure(true);
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

    afterEach(() => PerformanceDiagnostics.configure(false));

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

    it('saves to the new database instance after reopening the same collection in another directory', async () => {
        collections.set('notebooks', {});
        collections.set('notes', {});
        const firstDatabase = database;
        const first = store.initializeAsync('/old/Work/Work.db');
        load();
        await first;
        const newSave = jest.fn((callback) => callback());
        const newDatabase = {
            loadDatabase: jest.fn((_options, callback) => callback()),
            getCollection: jest.fn((name) => collections.get(name)),
            saveDatabase: newSave,
        };
        (loki as jest.Mock).mockImplementationOnce(() => newDatabase);
        await store.initializeAsync('/new/Work/Work.db');
        await store.saveAsync();
        expect(loki).toHaveBeenLastCalledWith('/new/Work/Work.db');
        expect(newSave).toHaveBeenCalledTimes(1);
        expect(firstDatabase.saveDatabase).not.toHaveBeenCalled();
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

    it('separates synchronous save blocking from callback completion', async () => {
        collections.set('notebooks', {});
        collections.set('notes', {});
        const initialization = store.initializeAsync('collection.db');
        load();
        await initialization;
        const clock = jest.spyOn(performance, 'now').mockReturnValue(0);
        const warn = jest.spyOn(Logger.prototype, 'warn').mockClear();
        database.saveDatabase.mockImplementation((callback) => {
            save = callback;
            clock.mockReturnValue(200);
        });
        try {
            const saving = store.saveAsync();
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/Database.save synchronous call .*finished in 200.0 ms/), 'Performance', 'operation',
            );
            clock.mockReturnValue(1200);
            save();
            await saving;
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/Database.save #.*finished in 1200.0 ms/), 'Performance', 'operation',
            );
        } finally {
            clock.mockRestore();
        }
    });

    it('logs failures from mutation-triggered saves without starting extra writes', async () => {
        collections.set('notebooks', { insert: jest.fn() });
        collections.set('notes', {});
        const initialization = store.initializeAsync('collection.db');
        load();
        await initialization;
        const error = new Error('Cannot write');
        database.saveDatabase.mockImplementation((callback) => callback(error));
        const logError = jest.spyOn(Logger.prototype, 'error').mockClear();
        store.addNotebook('Private name');
        expect(database.saveDatabase).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalledWith('Database save failed: Error: Cannot write', 'LokiDataStore', 'saveDatabase');
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
        const modificationDate = note.modificationDate;
        note.isPinned = true;
        note.isMarked = false;
        store.updateNoteWithoutDate(note);
        expect(store.getNoteById(noteId).modificationDate).toBe(modificationDate);
        expect(store.getNoteById(noteId).isPinned).toBe(true);
        expect(store.getNoteById(noteId).isMarked).toBe(false);
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

    it('persists archiving and unarchiving without moving or deleting notebook notes', async () => {
        const Loki = jest.requireActual('lokijs');
        const adapter = new Loki.LokiMemoryAdapter();
        (loki as jest.Mock).mockImplementation((filename) => new Loki(filename, { adapter }));
        await store.initializeAsync('archive.db');
        const notebookId = store.addNotebook('Work');
        const noteId = store.addNote('Keep me', notebookId, true);
        const notebook = store.getNotebookById(notebookId);
        notebook.isArchived = true;
        store.updateNotebook(notebook, false);
        await store.saveAsync();

        await store.initializeAsync('archive.db');
        expect(store.getNotebookById(notebookId).isArchived).toBe(true);
        expect(store.getNotebookNotes(notebookId).map((note) => note.id)).toEqual([noteId]);
        expect(store.getUnfiledNotes()).toEqual([]);
        const reloaded = store.getNotebookById(notebookId);
        reloaded.isArchived = false;
        store.updateNotebook(reloaded, false);
        await store.saveAsync();

        await store.initializeAsync('archive.db');
        expect(store.getNotebookById(notebookId).isArchived).toBe(false);
        expect(store.getNotebookNotes(notebookId).map((note) => note.id)).toEqual([noteId]);
    });
});
