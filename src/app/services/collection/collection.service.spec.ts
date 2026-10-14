import * as remote from '@electron/remote';
import { IMock, It, Mock } from 'typemoq';
import { Operation } from '../../common/enums/operation';
import { FileAccess } from '../../common/io/file-access';
import { Logger } from '../../common/logging/logger';
import { Scheduler } from '../../common/scheduling/scheduler';
import { BaseSettings } from '../../common/settings/base-settings';
import { Note } from '../../data/entities/note';
import { BaseAppearanceService } from '../appearance/base-appearance.service';
import { CryptographyService } from '../cryptography/cryptography.service';
import { SearchService } from '../search/search.service';
import { TemporaryStorageService } from '../temporary-storage/temporary-storage.service';
import { TranslatorService } from '../translator/translator.service';
import { CollectionDataStoreAccess } from './collection-data-store.access';
import { CollectionEvents } from './collection-events';
import { CollectionFileAccess } from './collection-file-access';
import { CollectionService } from './collection.service';
import { NoteDateFormatter } from './note-date-formatter';
import { NoteModelFactory } from './note-model-factory';

jest.mock('@electron/remote', () => ({ getGlobal: jest.fn() }));
jest.mock('electron', () => ({ ipcRenderer: { send: jest.fn() } }));
jest.mock('nanoid', () => ({ nanoid: () => 'note-id' }));
jest.mock('../../data/entities/note', () => ({
    Note: class {
        public text = '';
        public isEncrypted = false;
        public constructor(public title: string, public notebookId: string, public isMarkdownNote: boolean) {}
    },
}));
jest.mock('../../data/data-store', () => ({ DataStore: class {} }));
jest.mock('../../common/utils/date-utils', () => ({ DateUtils: class {} }));
jest.mock('./note-date-formatter', () => ({ NoteDateFormatter: class {} }));
jest.mock('../temporary-storage/temporary-storage.service', () => ({ TemporaryStorageService: class {} }));

describe('CollectionService note deletion', () => {
    let service: CollectionService;
    let settings: IMock<BaseSettings>;
    let files: IMock<CollectionFileAccess>;
    let fileAccess: IMock<FileAccess>;
    let data: IMock<CollectionDataStoreAccess>;
    let scheduler: IMock<Scheduler>;
    let notes: Note[];
    let contents: Map<string, string>;
    let trashNote: jest.Mock;
    let deleteNote: jest.Mock;
    let deleteFiles: jest.Mock;
    let logError: jest.Mock;
    let emit: jest.Mock;
    let notesChanged: jest.Mock;
    let useTrash: boolean;
    let skipEmpty: boolean;
    let attachments: string[] | undefined;
    let readError: Error | undefined;

    beforeEach(() => {
        useTrash = true;
        skipEmpty = true;
        attachments = undefined;
        readError = undefined;
        settings = Mock.ofType<BaseSettings>();
        settings.setup((x) => x.moveDeletedNotesToTrash).returns(() => useTrash);
        settings.setup((x) => x.skipTrashForEmptyNotes).returns(() => skipEmpty);
        settings.setup((x) => x.activeCollection).returns(() => 'collection');
        files = Mock.ofType<CollectionFileAccess>();
        fileAccess = Mock.ofType<FileAccess>();
        data = Mock.ofType<CollectionDataStoreAccess>();
        scheduler = Mock.ofType<Scheduler>();
        notes = [];
        contents = new Map();
        trashNote = jest.fn();
        deleteNote = jest.fn();
        deleteFiles = jest.fn().mockResolvedValue(undefined);
        logError = jest.fn();
        emit = jest.fn();
        (remote.getGlobal as jest.Mock).mockReturnValue({ emit });
        data.setup((x) => x.getNoteById(It.isAnyString())).returns((id: string) => notes.find((note) => note.id === id));
        data.setup((x) => x.trashNote(It.isAnyString())).callback(trashNote);
        data.setup((x) => x.deleteNote(It.isAnyString())).callback(deleteNote);
        files.setup((x) => x.getNoteContentByNoteIdAsync(It.isAnyString(), 'collection', It.isAny()))
            .returns(async (id: string) => {
                if (readError) {
                    throw readError;
                }
                return contents.get(id);
            });
        files.setup((x) => x.getNoteAttachmentsDirectoryPath(It.isAnyString(), 'collection')).returns(() => '/attachments');
        files.setup((x) => x.deleteNoteFilesAsync(It.isAnyString(), 'collection', It.isAny())).returns(deleteFiles);
        fileAccess.setup((x) => x.pathExists('/attachments')).returns(() => attachments !== undefined);
        fileAccess.setup((x) => x.getFilesInDirectoryAsync('/attachments')).returns(async () => attachments);
        const logger = Mock.ofType<Logger>();
        logger.setup((x) => x.error(It.isAnyString(), It.isAnyString(), It.isAnyString())).callback(logError);

        service = new CollectionService(
            Mock.ofType<TranslatorService>().object,
            Mock.ofType<SearchService>().object,
            Mock.ofType<BaseAppearanceService>().object,
            Mock.ofType<CryptographyService>().object,
            files.object,
            data.object,
            Mock.ofType<TemporaryStorageService>().object,
            Mock.ofType<NoteModelFactory>().object,
            Mock.ofType<NoteDateFormatter>().object,
            fileAccess.object,
            scheduler.object,
            settings.object,
            logger.object,
        );
        notesChanged = jest.fn();
        service.notesChanged$.subscribe(notesChanged);
    });

    function addNote(isMarkdownNote: boolean, content: string, text = ''): Note {
        const note = new Note('New note', '', isMarkdownNote);
        note.id = `note-${notes.length}`;
        note.text = text;
        notes.push(note);
        contents.set(note.id, content);
        return note;
    }

    it.each([
        [true, ''],
        [true, ' \n\t'],
        [false, ''],
        [false, '{"ops":[{"insert":"\\n"}]}'],
        [false, '{"ops":[{"insert":" \\n","attributes":{"bold":true}}]}'],
    ])('permanently deletes an empty note (markdown=%s, content=%s)', async (markdown, content) => {
        const note = addNote(markdown, content, '\n');

        expect(await service.deleteNotesAsync([note.id])).toBe(Operation.Success);

        expect(trashNote).not.toHaveBeenCalled();
        expect(deleteFiles).toHaveBeenCalledWith(note.id, 'collection', markdown);
        expect(deleteNote).toHaveBeenCalledWith(note.id);
        expect(notesChanged).toHaveBeenCalledTimes(1);
    });

    it.each([
        [true, 'Some text'],
        [true, '![image](attachments/image.png)'],
        [false, '{"ops":[{"insert":"Some text\\n"}]}'],
        [false, '{"ops":[{"insert":{"image":"data:image/png;base64,image"}},{"insert":"\\n"}]}'],
        [false, '{"ops":[{"insert":{"video":"video-url"}},{"insert":"\\n"}]}'],
    ])('keeps non-empty content in the trash (markdown=%s, content=%s)', async (markdown, content) => {
        const note = addNote(markdown, content);

        expect(await service.deleteNotesAsync([note.id])).toBe(Operation.Success);

        expect(trashNote).toHaveBeenCalledWith(note.id);
        expect(deleteNote).not.toHaveBeenCalled();
    });

    it('keeps notes with attachments in the trash', async () => {
        const note = addNote(true, '');
        attachments = ['/attachments/image.png'];

        await service.deleteNotesAsync([note.id]);

        expect(trashNote).toHaveBeenCalledWith(note.id);
        expect(deleteNote).not.toHaveBeenCalled();
    });

    it('skips trash when the attachments directory exists but is empty', async () => {
        const note = addNote(true, '');
        attachments = [];

        await service.deleteNotesAsync([note.id]);

        expect(deleteNote).toHaveBeenCalledWith(note.id);
    });

    it('keeps encrypted notes in the trash', async () => {
        const note = addNote(false, '');
        note.isEncrypted = true;

        await service.deleteNotesAsync([note.id]);

        expect(trashNote).toHaveBeenCalledWith(note.id);
    });

    it('keeps notes with saved text in the trash even if their content file is empty', async () => {
        const note = addNote(false, '', 'Saved text');

        await service.deleteNotesAsync([note.id]);

        expect(trashNote).toHaveBeenCalledWith(note.id);
    });

    it('moves empty notes to the trash when the option is disabled', async () => {
        skipEmpty = false;
        const note = addNote(false, '');

        await service.deleteNotesAsync([note.id]);

        expect(trashNote).toHaveBeenCalledWith(note.id);
        expect(deleteNote).not.toHaveBeenCalled();
    });

    it('permanently deletes non-empty notes when trash is disabled', async () => {
        useTrash = false;
        const note = addNote(true, 'Text', 'Text');

        await service.deleteNotesAsync([note.id]);

        expect(deleteNote).toHaveBeenCalledWith(note.id);
        expect(trashNote).not.toHaveBeenCalled();
    });

    it('handles empty and non-empty notes independently in a batch', async () => {
        const empty = addNote(false, '{"ops":[{"insert":"\\n"}]}');
        const nonEmpty = addNote(true, 'Text');

        await service.deleteNotesAsync([empty.id, nonEmpty.id]);

        expect(deleteNote).toHaveBeenCalledTimes(1);
        expect(deleteNote).toHaveBeenCalledWith(empty.id);
        expect(trashNote).toHaveBeenCalledTimes(1);
        expect(trashNote).toHaveBeenCalledWith(nonEmpty.id);
    });

    it.each(['invalid JSON', '{}', '{"ops":[{}]}'])('reports invalid content without deleting the note: %s', async (content) => {
        const note = addNote(false, content);

        expect(await service.deleteNotesAsync([note.id])).toBe(Operation.Error);

        expect(deleteNote).not.toHaveBeenCalled();
        expect(trashNote).not.toHaveBeenCalled();
        expect(logError).toHaveBeenCalled();
    });

    it('reports content read failures without deleting the note', async () => {
        const note = addNote(true, '');
        readError = new Error('Cannot read');

        expect(await service.deleteNotesAsync([note.id])).toBe(Operation.Error);

        expect(deleteNote).not.toHaveBeenCalled();
        expect(logError).toHaveBeenCalled();
    });

    it('preserves the database entry when deleting files fails', async () => {
        const note = addNote(true, '');
        deleteFiles.mockRejectedValue(new Error('Cannot delete'));

        expect(await service.deleteNotesAsync([note.id])).toBe(Operation.Error);

        expect(deleteNote).not.toHaveBeenCalled();
        expect(logError).toHaveBeenCalled();
    });

    it('waits for open notes to save before checking for empty content', async () => {
        const note = addNote(true, '');
        await service.setNoteOpenAsync(note.id, true);
        emit.mockImplementation((event: string, id: string, callback: (operation: Operation) => void) => {
            if (event === CollectionEvents.prepareNoteDeletionEvent) {
                contents.set(id, 'Unsaved text');
                callback(Operation.Success);
            }
        });

        await service.deleteNotesAsync([note.id]);

        expect(trashNote).toHaveBeenCalledWith(note.id);
        expect(deleteNote).not.toHaveBeenCalled();
    });

    it('does not delete an open note when saving fails', async () => {
        const note = addNote(true, '');
        await service.setNoteOpenAsync(note.id, true);
        emit.mockImplementation((event: string, id: string, callback: (operation: Operation) => void) => {
            if (event === CollectionEvents.prepareNoteDeletionEvent) {
                callback(Operation.Error);
            }
        });

        expect(await service.deleteNotesAsync([note.id])).toBe(Operation.Error);

        expect(deleteNote).not.toHaveBeenCalled();
        expect(trashNote).not.toHaveBeenCalled();
        expect(logError).toHaveBeenCalled();
    });

    it('times out safely if an open note does not respond', async () => {
        const note = addNote(true, '');
        await service.setNoteOpenAsync(note.id, true);
        scheduler.setup((x) => x.sleepAsync(50)).returns(async () => undefined);

        expect(await service.deleteNotesAsync([note.id])).toBe(Operation.Error);

        expect(deleteNote).not.toHaveBeenCalled();
        expect(trashNote).not.toHaveBeenCalled();
        expect(logError).toHaveBeenCalled();
    });
});
