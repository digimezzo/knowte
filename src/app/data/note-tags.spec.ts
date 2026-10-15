import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { LokiDataStore } from './loki-data-store';

jest.mock('nanoid', () => ({ nanoid: () => 'note-id' }));

describe('Note tag persistence', () => {
    let directory: string;
    let databaseFile: string;

    beforeEach(async () => {
        directory = await mkdtemp(join(tmpdir(), 'knowte-note-tags-'));
        databaseFile = join(directory, 'collection.db');
    });

    afterEach(async () => {
        await rm(directory, { recursive: true, force: true });
    });

    it('retains tags when the collection is saved and reopened', async () => {
        const store = new LokiDataStore();
        await store.initializeAsync(databaseFile);
        const id = store.addNote('Title', '', false);
        const note = store.getNoteById(id);
        expect(note.tags).toEqual([]);
        note.tags = ['work', 'project alpha'];
        store.updateNoteWithoutDate(note);
        await store.saveAsync();

        const reopened = new LokiDataStore();
        await reopened.initializeAsync(databaseFile);

        expect(reopened.getNoteById(id).tags).toEqual(['work', 'project alpha']);
    });

    it('can add tags to notes from an older collection without losing other fields', async () => {
        const store = new LokiDataStore();
        await store.initializeAsync(databaseFile);
        const id = store.addNote('Older title', 'notebook', true);
        await store.saveAsync();
        const database = JSON.parse(await readFile(databaseFile, 'utf8'));
        const storedNote = database.collections.find((collection) => collection.name === 'notes').data[0];
        delete storedNote.tags;
        await writeFile(databaseFile, JSON.stringify(database));

        const reopened = new LokiDataStore();
        await reopened.initializeAsync(databaseFile);
        const note = reopened.getNoteById(id);
        expect(note.tags).toBeUndefined();
        note.tags = ['work'];
        reopened.updateNoteWithoutDate(note);
        await reopened.saveAsync();

        const finalStore = new LokiDataStore();
        await finalStore.initializeAsync(databaseFile);
        expect(finalStore.getNoteById(id)).toMatchObject({
            title: 'Older title', notebookId: 'notebook', isMarkdownNote: true, tags: ['work'],
        });
    });
});
