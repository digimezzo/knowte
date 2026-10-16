import * as remote from '@electron/remote';
import { EventEmitter } from 'events';
import { ipcRenderer } from 'electron';
import { IMock, It, Mock } from 'typemoq';
import { Constants } from '../../common/application/constants';
import { Operation } from '../../common/enums/operation';
import { FileAccess } from '../../common/io/file-access';
import { Logger } from '../../common/logging/logger';
import { Scheduler } from '../../common/scheduling/scheduler';
import { BaseSettings } from '../../common/settings/base-settings';
import { TasksCount } from '../../common/ui/tasks-count';
import { Note } from '../../data/entities/note';
import { Notebook } from '../../data/entities/notebook';
import { BaseAppearanceService } from '../appearance/base-appearance.service';
import { CryptographyService } from '../cryptography/cryptography.service';
import { SearchService } from '../search/search.service';
import { TemporaryStorageService } from '../temporary-storage/temporary-storage.service';
import { TranslatorService } from '../translator/translator.service';
import { CollectionDataStoreAccess } from './collection-data-store.access';
import { CollectionClient } from './collection.client';
import { CollectionEvents } from './collection-events';
import { CollectionFileAccess } from './collection-file-access';
import { CollectionService } from './collection.service';
import { NoteDateFormatter } from './note-date-formatter';
import { NoteModelFactory } from './note-model-factory';
import { NoteModel } from './note-model';

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
jest.mock('../../common/utils/date-utils', () => ({
    DateUtils: class {
        public static getFormattedDate(): string { return 'Formatted date'; }
    },
}));
jest.mock('./note-date-formatter', () => ({ NoteDateFormatter: class {} }));
jest.mock('../temporary-storage/temporary-storage.service', () => ({ TemporaryStorageService: class {} }));

describe('CollectionService note deletion', () => {
    let service: CollectionService;
    let settings: IMock<BaseSettings>;
    let files: IMock<CollectionFileAccess>;
    let fileAccess: IMock<FileAccess>;
    let data: IMock<CollectionDataStoreAccess>;
    let scheduler: IMock<Scheduler>;
    let translator: IMock<TranslatorService>;
    let modelFactory: IMock<NoteModelFactory>;
    let temporaryStorage: IMock<TemporaryStorageService>;
    let notes: Note[];
    let contents: Map<string, string>;
    let trashNote: jest.Mock;
    let deleteNote: jest.Mock;
    let deleteFiles: jest.Mock;
    let logError: jest.Mock;
    let emit: jest.Mock;
    let globalEmitter: { emit: jest.Mock; on: jest.Mock; removeListener: jest.Mock };
    let notesChanged: jest.Mock;
    let useTrash: boolean;
    let skipEmpty: boolean;
    let attachments: string[] | undefined;
    let readError: Error | undefined;
    let notebooks: Notebook[];
    let search: IMock<SearchService>;
    let dateFormatter: IMock<NoteDateFormatter>;

    beforeEach(() => {
        useTrash = true;
        skipEmpty = true;
        attachments = undefined;
        readError = undefined;
        settings = Mock.ofInstance<BaseSettings>({
            ...Mock.ofType<BaseSettings>().object,
            activeCollection: 'collection',
            moveDeletedNotesToTrash: true,
            skipTrashForEmptyNotes: true,
            showArchivedNotebooks: false,
        });
        settings.setup((x) => x.moveDeletedNotesToTrash).returns(() => useTrash);
        settings.setup((x) => x.skipTrashForEmptyNotes).returns(() => skipEmpty);
        settings.setup((x) => x.activeCollection).returns(() => service.activeCollection || 'collection');
        files = Mock.ofType<CollectionFileAccess>();
        fileAccess = Mock.ofType<FileAccess>();
        data = Mock.ofType<CollectionDataStoreAccess>();
        scheduler = Mock.ofType<Scheduler>();
        translator = Mock.ofType<TranslatorService>();
        modelFactory = Mock.ofType<NoteModelFactory>();
        temporaryStorage = Mock.ofType<TemporaryStorageService>();
        notes = [];
        notebooks = [];
        search = Mock.ofType<SearchService>();
        dateFormatter = Mock.ofType<NoteDateFormatter>();
        dateFormatter.setup((x) => x.getNoteDateFormatAsync(It.isAny(), It.isAny())).returns(async () => ({
            dateText: 'Today',
            isTodayNote: true,
            isYesterdayNote: false,
            isThisWeekNote: true,
        }));
        contents = new Map();
        trashNote = jest.fn();
        deleteNote = jest.fn();
        deleteFiles = jest.fn().mockResolvedValue(undefined);
        logError = jest.fn();
        emit = jest.fn();
        globalEmitter = { emit, on: jest.fn(), removeListener: jest.fn() };
        (remote.getGlobal as jest.Mock).mockReturnValue(globalEmitter);
        data.setup((x) => x.getNoteById(It.isAnyString())).returns((id: string) => notes.find((note) => note.id === id));
        data.setup((x) => x.getNotebooks()).returns(() => notebooks);
        data.setup((x) => x.getNotebookById(It.isAnyString())).returns((id: string) => notebooks.find((notebook) => notebook.id === id));
        data.setup((x) => x.getNotes()).returns(() => notes);
        data.setup((x) => x.getNotebookNotes(It.isAnyString())).returns((id: string) => notes.filter((note) => note.notebookId === id));
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
            translator.object,
            search.object,
            Mock.ofType<BaseAppearanceService>().object,
            Mock.ofType<CryptographyService>().object,
            files.object,
            data.object,
            temporaryStorage.object,
            modelFactory.object,
            dateFormatter.object,
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

    describe('notebook archiving', () => {
        let active: Notebook;
        let archived: Notebook;
        let legacy: Notebook;

        beforeEach(() => {
            active = new Notebook('Active');
            active.id = 'active';
            archived = new Notebook('Archived');
            archived.id = 'archived';
            archived.isArchived = true;
            legacy = new Notebook('Legacy');
            legacy.id = 'legacy';
            delete legacy.isArchived;
            notebooks.push(active, archived, legacy);
        });

        it('hides archived notebooks in both the main list and note-window picker', async () => {
            expect((await service.getNotebooksAsync(true)).map((notebook) => notebook.id))
                .toEqual([Constants.allNotesNotebookId, Constants.unfiledNotesNotebookId, 'active', 'legacy']);
            expect((await service.getNotebooksAsync(false)).map((notebook) => notebook.id))
                .toEqual([Constants.unfiledNotesNotebookId, 'active', 'legacy']);
        });

        it('shows archived notebooks without removing their archived status', async () => {
            settings.setup((x) => x.showArchivedNotebooks).returns(() => true);
            expect(await service.getNotebooksAsync(false)).toContain(archived);
            expect(archived.isArchived).toBe(true);
        });

        it.each(['', 'meeting', 't:work'])('excludes hidden archived notes from lists, search "%s", and counts', async (query) => {
            search.setup((x) => x.searchText).returns(() => query);
            for (const notebook of notebooks) {
                const note = addNote(true, '', 'meeting');
                note.notebookId = notebook.id;
                note.tags = ['work'];
                note.isMarked = true;
                note.isPinned = true;
            }
            const counts = jest.fn();
            service.notesCountChanged$.subscribe(counts);

            for (const category of [Constants.allCategory, Constants.todayCategory, Constants.thisWeekCategory, Constants.markedCategory]) {
                expect(await service.getNotesAsync(Constants.allNotesNotebookId, category, false)).toEqual([notes[0], notes[2]]);
                expect(counts).toHaveBeenLastCalledWith(expect.objectContaining({
                    allNotesCount: 2, todayNotesCount: 2, thisWeekNotesCount: 2, markedNotesCount: 2,
                }));
            }
            expect(await service.getNotesAsync('archived', Constants.allCategory, false)).toEqual([]);

            settings.setup((x) => x.showArchivedNotebooks).returns(() => true);
            expect(await service.getNotesAsync(Constants.allNotesNotebookId, Constants.allCategory, false)).toEqual(notes);
            expect(await service.getNotesAsync('archived', Constants.allCategory, false)).toEqual([notes[1]]);
        });

        it('waits for persistence before announcing archiving, and can unarchive', async () => {
            let finishSave: () => void;
            data.setup((x) => x.saveAsync()).returns(() => new Promise<void>((resolve) => { finishSave = resolve; }));
            const edited = jest.fn();
            service.notebookEdited$.subscribe(edited);
            const archiving = service.setNotebooksArchivedAsync(['active', 'legacy'], true);
            expect(edited).not.toHaveBeenCalled();
            expect(notesChanged).not.toHaveBeenCalled();
            finishSave();
            expect(await archiving).toBe(Operation.Success);
            expect(active.isArchived).toBe(true);
            expect(legacy.isArchived).toBe(true);
            expect(edited).toHaveBeenCalledTimes(1);
            expect(notesChanged).toHaveBeenCalledTimes(1);

            const unarchiving = service.setNotebooksArchivedAsync(['active'], false);
            finishSave();
            expect(await unarchiving).toBe(Operation.Success);
            expect(active.isArchived).toBe(false);
        });

        it('rolls back the archive state and reports save errors', async () => {
            data.setup((x) => x.saveAsync()).returns(() => Promise.reject(new Error('Disk full')));
            expect(await service.setNotebooksArchivedAsync(['active', 'legacy'], true)).toBe(Operation.Error);
            expect(active.isArchived).toBe(false);
            expect(legacy.isArchived).toBeUndefined();
            expect(logError).toHaveBeenCalled();
            expect(notesChanged).not.toHaveBeenCalled();
        });

        it.each([[[]], [[Constants.allNotesNotebookId]], [[Constants.unfiledNotesNotebookId]], [['missing']], [['active', 'missing']]])(
            'rejects invalid archive selections %j without changing notebooks',
            async (ids: string[]) => {
                expect(await service.setNotebooksArchivedAsync(ids, true)).toBe(Operation.Error);
                expect(active.isArchived).toBe(false);
                expect(logError).toHaveBeenCalled();
                expect(notesChanged).not.toHaveBeenCalled();
            },
        );

        it('also excludes hidden archived notes from trash and marked totals', () => {
            const visible = addNote(true, '');
            visible.notebookId = active.id;
            const hidden = addNote(true, '');
            hidden.notebookId = archived.id;
            data.setup((x) => x.getTrashedNotes()).returns(() => notes);
            data.setup((x) => x.getMarkedNotes()).returns(() => notes);
            const marked = jest.fn();
            service.noteMarkChanged$.subscribe(marked);

            expect(service.getTrashedNotes()).toEqual([visible]);
            service.setNoteMark(visible.id, true);
            expect(marked).toHaveBeenLastCalledWith(expect.objectContaining({ markedNotesCount: 1 }));

            settings.setup((x) => x.showArchivedNotebooks).returns(() => true);
            expect(service.getTrashedNotes()).toEqual(notes);
            service.setNoteMark(visible.id, true);
            expect(marked).toHaveBeenLastCalledWith(expect.objectContaining({ markedNotesCount: 2 }));
        });
    });

    describe('tags', () => {
        it('persists normalized tags before acknowledging success and refreshing notes', async () => {
            const note = addNote(false, 'Content');
            let finishSave: () => void;
            const saving = new Promise<void>((resolve) => { finishSave = resolve; });
            data.setup((x) => x.saveAsync()).returns(() => saving);
            const updated = jest.fn();
            service.noteEdited$.subscribe(updated);
            const callback = jest.fn();

            const save = service.saveNoteTagsEventHandler(note.id, [' Work ', 'work', 'project alpha', ''], callback);
            expect(callback).not.toHaveBeenCalled();
            expect(updated).not.toHaveBeenCalled();
            expect(note.tags).toEqual(['Work', 'project alpha']);

            finishSave();
            await save;
            expect(callback).toHaveBeenCalledWith(Operation.Success);
            expect(updated).toHaveBeenCalledTimes(1);
        });

        it('allows removing all tags', async () => {
            const note = addNote(false, 'Content');
            note.tags = ['work'];
            const callback = jest.fn();

            await service.saveNoteTagsEventHandler(note.id, [], callback);

            expect(note.tags).toEqual([]);
            expect(callback).toHaveBeenCalledWith(Operation.Success);
        });

        it('reports persistence failures and restores the previous tags', async () => {
            const note = addNote(false, 'Content');
            note.tags = ['original'];
            data.setup((x) => x.saveAsync()).returns(() => Promise.reject(new Error('Cannot persist tags')));
            const callback = jest.fn();
            const updated = jest.fn();
            service.noteEdited$.subscribe(updated);

            await service.saveNoteTagsEventHandler(note.id, ['new'], callback);

            expect(note.tags).toEqual(['original']);
            expect(callback).toHaveBeenCalledWith(Operation.Error);
            expect(updated).not.toHaveBeenCalled();
            expect(logError).toHaveBeenCalled();
        });

        it('reports a missing note instead of acknowledging success', async () => {
            const callback = jest.fn();
            await service.saveNoteTagsEventHandler('missing', ['work'], callback);
            expect(callback).toHaveBeenCalledWith(Operation.Error);
            expect(logError).toHaveBeenCalled();
        });

        it('matches exact tags only, independently of titles and body text', () => {
            const tagged = addNote(false, 'Content');
            tagged.tags = ['Work', 'project alpha'];
            const textOnly = addNote(false, 'Content', 'work');
            textOnly.title = 'Work';
            const partial = addNote(false, 'Content');
            partial.tags = ['homework'];

            expect(service['getFilteredNotes'](notes, 't:work')).toEqual([tagged]);
            expect(service['getFilteredNotes'](notes, ' T:WORK ')).toEqual([tagged]);
            expect(service['getFilteredNotes'](notes, 't:"project alpha"')).toEqual([tagged]);
            expect(service['getFilteredNotes'](notes, 't:project')).toEqual([]);
            expect(service['getFilteredNotes'](notes, 't:')).toEqual([]);
        });

        it('requires both an exact tag and all text terms across title and content', () => {
            const matching = addNote(false, 'Content', 'budget');
            matching.title = 'Meeting';
            matching.tags = ['Work', 'project alpha'];
            const tagOnly = addNote(false, 'Content');
            tagOnly.tags = ['work'];
            const textOnly = addNote(false, 'Content', 'meeting budget work');
            const partialTag = addNote(false, 'Content', 'meeting budget');
            partialTag.tags = ['homework'];

            expect(service['getFilteredNotes'](notes, 't:work meeting budget')).toEqual([matching]);
            expect(service['getFilteredNotes'](notes, ' T:WORK BUDGET meeting ')).toEqual([matching]);
            expect(service['getFilteredNotes'](notes, 't:"project alpha" meeting budget')).toEqual([matching]);
            expect(service['getFilteredNotes'](notes, 't:work meeting missing')).toEqual([]);
            expect(service['getFilteredNotes'](notes, 't:"work meeting')).toEqual([]);
            expect(service['getFilteredNotes'](notes, 't:"" meeting')).toEqual([]);
        });

        it('requires every tag filter and all title/content terms', () => {
            const matching = addNote(false, 'Content', 'budget');
            matching.title = 'Meeting';
            matching.tags = ['Work', 'urgent', 'project alpha'];
            const firstOnly = addNote(false, 'Content', 'meeting budget urgent');
            firstOnly.tags = ['work'];
            const secondOnly = addNote(false, 'Content', 'meeting budget work');
            secondOnly.tags = ['urgent'];
            const tagsOnly = addNote(false, 'Content');
            tagsOnly.tags = ['work', 'urgent'];

            expect(service['getFilteredNotes'](notes, 't:work t:urgent')).toEqual([matching, tagsOnly]);
            expect(service['getFilteredNotes'](notes, 't:work t:urgent meeting budget')).toEqual([matching]);
            expect(service['getFilteredNotes'](notes, 'T:URGENT t:"Project Alpha" meeting')).toEqual([matching]);
            expect(service['getFilteredNotes'](notes, 't:work t:work')).toEqual([matching, firstOnly, tagsOnly]);
            expect(service['getFilteredNotes'](notes, 't:work t:missing')).toEqual([]);
            expect(service['getFilteredNotes'](notes, 't:work t:')).toEqual([]);
        });

        it('keeps ordinary title/body searches unchanged and does not search tag metadata', () => {
            const tagged = addNote(false, 'Content');
            tagged.tags = ['work'];
            const textOnly = addNote(false, 'Content', 'work meeting');
            const literalPrefix = addNote(false, 'Content', 'tag:work');

            expect(service['getFilteredNotes'](notes, 'work meeting')).toEqual([textOnly]);
            expect(service['getFilteredNotes'](notes, 'work')).toEqual([textOnly, literalPrefix]);
            expect(service['getFilteredNotes'](notes, 'tag:work')).toEqual([literalPrefix]);
            expect(service['getFilteredNotes'](notes, '')).toBe(notes);
        });

        describe('native imports', () => {
            beforeEach(() => {
                translator.setup((x) => x.getAsync(It.isAnyString())).returns(async () => 'Imported');
                data.setup((x) => x.getNotesWithIdenticalBaseTitle(It.isAnyString())).returns(() => notes);
                data.setup((x) => x.addNote(It.isAnyString(), '', It.isAny())).returns((title, _notebookId, markdown) =>
                    addNote(markdown, '').id);
                data.setup((x) => x.getNoteByTitle(It.isAnyString())).returns(() => notes[notes.length - 1]);
                fileAccess.setup((x) => x.combinePath(It.isAnyString(), It.isAnyString()))
                    .returns((parent, child) => `${parent}/${child}`);
                temporaryStorage.setup((x) => x.extractArchiveAsync('/export')).returns(async () => '/extracted');
                fileAccess.setup((x) => x.getFilesInDirectoryAsync('/extracted')).returns(async () => ['/extracted/note.md']);
                fileAccess.setup((x) => x.getFileExtension('/extracted/note.md')).returns(() => '.md');
                fileAccess.setup((x) => x.getFileContentAsString('/extracted/note.md')).returns(() => 'Markdown content');
            });

            it.each([
                [false, [' Work ', 'work', 'project alpha']],
                [true, [' Work ', 'work', 'project alpha']],
                [false, undefined],
                [true, undefined],
            ])('imports tags and supports older exports (markdown=%s, tags=%p)', async (markdown, tags) => {
                files.setup((x) => x.isMarkdownNoteExport('/export')).returns(() => markdown);
                const metadata = JSON.stringify({ title: 'Title', text: 'Text', content: 'Content', tags });
                files.setup((x) => x.getNoteContentAsync(markdown ? '/extracted/metadata.json' : '/export'))
                    .returns(async () => metadata);

                expect(await service.importNoteFilesAsync(['/export'])).toBe(Operation.Success);
                expect(notes[0].tags).toEqual(tags ? ['Work', 'project alpha'] : []);
            });

            it('rejects invalid imported tag metadata before creating a note', async () => {
                files.setup((x) => x.getNoteContentAsync('/export'))
                    .returns(async () => JSON.stringify({ title: 'Title', text: 'Text', content: 'Content', tags: 'work' }));

                expect(await service.importNoteFilesAsync(['/export'])).toBe(Operation.Error);
                expect(notes).toEqual([]);
                expect(logError).toHaveBeenCalled();
            });
        });
    });

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

    describe('initialization', () => {
        let initializeStore: jest.Mock;
        let on: jest.Mock;

        beforeEach(() => {
            initializeStore = jest.fn().mockResolvedValue(undefined);
            on = globalEmitter.on;
            files.setup((x) => x.collectionAndItsDirectoryExistAsync('collection')).returns(async () => true);
            files.setup((x) => x.getCollectionDirectoryPath('collection')).returns(() => '/collection');
            data.setup((x) => x.initializeAsync('collection')).returns(() => initializeStore());
        });

        it('waits for data loading and initializes only once for concurrent callers', async () => {
            let resolveLoading: () => void;
            initializeStore.mockReturnValue(new Promise<void>((resolve) => (resolveLoading = resolve)));
            const completed = jest.fn();

            const first = service.initializeAsync().then(completed);
            const second = service.initializeAsync().then(completed);
            // Allow the two asynchronous file checks to complete.
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();

            expect(initializeStore).toHaveBeenCalledTimes(1);
            expect(completed).not.toHaveBeenCalled();
            expect(on).not.toHaveBeenCalled();

            resolveLoading();
            await Promise.all([first, second]);
            await service.initializeAsync();

            expect(completed).toHaveBeenCalledTimes(2);
            expect(initializeStore).toHaveBeenCalledTimes(1);
            expect(on).toHaveBeenCalled();
        });

        it('rejects concurrent callers on failure and allows a retry', async () => {
            const error = new Error('Cannot load database');
            initializeStore.mockRejectedValueOnce(error);
            const first = service.initializeAsync();
            const second = service.initializeAsync();

            await expect(first).rejects.toBe(error);
            await expect(second).rejects.toBe(error);
            expect(on).not.toHaveBeenCalled();
            expect(logError).toHaveBeenCalled();

            await service.initializeAsync();

            expect(initializeStore).toHaveBeenCalledTimes(2);
            expect(on).toHaveBeenCalled();
        });
    });

    describe('note links across windows', () => {
        let client: CollectionClient;

        beforeEach(async () => {
            const bus = new EventEmitter();
            globalEmitter.on.mockImplementation((event, listener) => bus.on(event, listener));
            globalEmitter.removeListener.mockImplementation((event, listener) => bus.removeListener(event, listener));
            emit.mockImplementation((event, ...args) => bus.emit(event, ...args));
            scheduler.setup((x) => x.sleepAsync(It.isAnyNumber())).returns(async () => undefined);
            files.setup((x) => x.collectionAndItsDirectoryExistAsync('collection')).returns(async () => true);
            files.setup((x) => x.getCollectionDirectoryPath('collection')).returns(() => '/collection');
            data.setup((x) => x.initializeAsync('collection')).returns(async () => undefined);
            translator.setup((x) => x.getAsync('MainPage.UnfiledNotes')).returns(async () => 'Unfiled');
            await service.initializeAsync();
            client = new CollectionClient(scheduler.object);
            (ipcRenderer.send as jest.Mock).mockClear();
        });

        it('lists only title, ID and notebook, including classic and encrypted notes but not trash', async () => {
            const markdown = addNote(true, 'Private content');
            markdown.title = 'Same title';
            markdown.notebookId = 'book';
            const classic = addNote(false, 'Private content');
            classic.title = 'Same title';
            classic.isEncrypted = true;
            const trashed = addNote(true, 'Trash');
            trashed.isTrashed = true;
            notebooks.push({ id: 'book', name: 'Notebook', isDefault: false, isSelected: false });

            const result = await client.getNoteLinkTargetsAsync();

            expect(result.operation).toBe(Operation.Success);
            expect(result.notes).toEqual([
                { id: markdown.id, title: 'Same title', notebookName: 'Notebook' },
                { id: classic.id, title: 'Same title', notebookName: 'Unfiled' },
            ]);
        });

        it('transfers a serialized snapshot instead of remote object references', async () => {
            const note = addNote(true, '');
            const received = jest.fn();
            emit(CollectionEvents.getNoteLinkTargetsEvent, received);
            await Promise.resolve();
            expect(received).toHaveBeenCalledWith(expect.any(String));

            const result = await client.getNoteLinkTargetsAsync();
            const originalTitle = note.title;
            note.title = 'Changed after transfer';
            expect(result.notes[0].title).toBe(originalTitle);
            result.notes[0].title = 'Local change';
            expect(note.title).toBe('Changed after transfer');
        });

        it('rejects malformed transfer data so the picker can report the error', async () => {
            globalEmitter.emit.mockImplementation((event, ...args) => {
                if (event === CollectionEvents.getNoteLinkTargetsEvent) {
                    args[0]('invalid JSON');
                    return true;
                }
                if (event === CollectionEvents.getIsInitializedEvent) {
                    args[0](true);
                    return true;
                }
                return false;
            });
            await expect(client.getNoteLinkTargetsAsync()).rejects.toThrow();
        });

        it('opens a linked note, then focuses the existing window instead of duplicating it', async () => {
            const note = addNote(true, '');
            expect(await client.openLinkedNoteAsync(note.id)).toBe(Operation.Success);
            expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
            expect(ipcRenderer.send).toHaveBeenCalledWith('open-note-window', expect.objectContaining({ noteId: note.id }));

            expect(await client.openLinkedNoteAsync(note.id)).toBe(Operation.Success);
            expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
            expect(emit).toHaveBeenCalledWith(CollectionEvents.focusNoteEvent, note.id);
        });

        it('keeps a link valid after renaming and moving between notebooks', async () => {
            const note = addNote(true, '');
            note.title = 'Renamed';
            note.notebookId = 'another-notebook';
            expect(await client.openLinkedNoteAsync(note.id)).toBe(Operation.Success);
            expect(ipcRenderer.send).toHaveBeenCalledWith('open-note-window', expect.objectContaining({ noteId: note.id }));
        });

        it.each([true, false])('uses normal note windows for markdown=%s, preserving the unlock flow', async (markdown) => {
            const note = addNote(markdown, '');
            note.isEncrypted = true;
            expect(await client.openLinkedNoteAsync(note.id)).toBe(Operation.Success);
            expect(ipcRenderer.send).toHaveBeenCalledWith('open-note-window', expect.objectContaining({ noteId: note.id }));
        });

        it('rejects missing, trashed and malformed destinations without creating windows', async () => {
            const trashed = addNote(true, '');
            trashed.isTrashed = true;
            for (const id of ['missing', trashed.id, '../bad']) {
                expect(await client.openLinkedNoteAsync(id)).toBe(Operation.Blank);
            }
            expect(ipcRenderer.send).not.toHaveBeenCalled();
        });

        it('reports listing errors rather than returning a successful empty list', async () => {
            data.reset();
            data.setup((x) => x.getNotes()).throws(new Error('Cannot read notes'));
            expect(await client.getNoteLinkTargetsAsync()).toEqual({ operation: Operation.Error, notes: [] });
            expect(logError).toHaveBeenCalled();
        });

        it('reports opening errors and permits retrying the same link', async () => {
            const note = addNote(true, '');
            (ipcRenderer.send as jest.Mock).mockImplementationOnce(() => { throw new Error('Cannot open window'); });
            expect(await client.openLinkedNoteAsync(note.id)).toBe(Operation.Error);
            expect(service.noteIsOpen(note.id)).toBe(false);
            expect(logError).toHaveBeenCalled();
            expect(await client.openLinkedNoteAsync(note.id)).toBe(Operation.Success);
        });
    });

    describe('multi-window collection operations', () => {
        let destination: IMock<CollectionDataStoreAccess>;
        let openDestination: jest.Mock;
        let saveDestination: jest.Mock;
        let saveSource: jest.Mock;
        let saveContent: jest.Mock;
        let updateSource: jest.Mock;
        let destinationNotes: Note[];
        let clients: CollectionClient[];

        beforeEach(async () => {
            const bus = new EventEmitter();
            globalEmitter.on.mockImplementation((event, listener) => bus.on(event, listener));
            globalEmitter.removeListener.mockImplementation((event, listener) => bus.removeListener(event, listener));
            emit.mockImplementation((event, ...args) => bus.emit(event, ...args));
            scheduler.setup((x) => x.sleepAsync(It.isAnyNumber())).returns(async () =>
                new Promise<void>((resolve) => setTimeout(resolve, 0)));
            files.setup((x) => x.collectionAndItsDirectoryExistAsync('collection')).returns(async () => true);
            files.setup((x) => x.getCollectionDirectoryPath('collection')).returns(() => '/collection');
            data.setup((x) => x.initializeAsync(It.isAnyString())).returns(async () => undefined);
            data.setup((x) => x.getNotebooks()).returns(() => []);
            data.setup((x) => x.getNotesWithIdenticalBaseTitle(It.isAnyString())).returns(() => notes);
            translator.setup((x) => x.getAsync(It.isAnyString())).returns(async (key) =>
                key === 'Notes.Moved' ? 'Moved' : 'Unfiled');
            files.setup((x) => x.getNoteContentByNoteId(It.isAnyString(), 'collection', It.isAny()))
                .returns((id: string) => contents.get(id));
            modelFactory.setup((x) => x.create(It.isAny())).returns((note: Note) =>
                new NoteModel(note, settings.object, files.object));
            updateSource = jest.fn();
            data.setup((x) => x.updateNote(It.isAny())).callback(updateSource);
            destination = Mock.ofType<CollectionDataStoreAccess>();
            destination.setup((x) => x['then']).returns(() => undefined);
            destinationNotes = [];
            destination.setup((x) => x.getNotesWithIdenticalBaseTitle(It.isAnyString())).returns(() => destinationNotes);
            destination.setup((x) => x.addNote(It.isAnyString(), '', It.isAny())).returns((title, _notebookId, markdown) => {
                const note = new Note(title, '', markdown);
                note.id = `destination-${destinationNotes.length}`;
                destinationNotes.push(note);
                return note.id;
            });
            destination.setup((x) => x.getNoteById(It.isAnyString())).returns((id) =>
                destinationNotes.find((note) => note.id === id));
            openDestination = jest.fn().mockResolvedValue(destination.object);
            data.setup((x) => x.openCollectionAsync('destination')).returns(openDestination);
            saveDestination = jest.fn().mockResolvedValue(undefined);
            saveSource = jest.fn().mockResolvedValue(undefined);
            destination.setup((x) => x.saveAsync()).returns(saveDestination);
            data.setup((x) => x.saveAsync()).returns(saveSource);
            saveContent = jest.fn().mockResolvedValue(undefined);
            files.setup((x) => x.saveNoteContentAsync(It.isAnyString(), It.isAnyString(), 'destination', It.isAny()))
                .returns(saveContent);
            await service.initializeAsync();
            clients = [new CollectionClient(scheduler.object), new CollectionClient(scheduler.object)];
        });

        async function saveFromBothWindows(first: Note, second: Note): Promise<void> {
            expect(await Promise.all([
                clients[0].saveNoteTextAsync(first.id, 'Window one', false, '', new TasksCount(1, 2)),
                clients[1].saveNoteTextAsync(second.id, 'Window two', false, '', new TasksCount(3, 4)),
            ])).toEqual([Operation.Success, Operation.Success]);
            expect(first.text).toBe('Window one');
            expect(second.text).toBe('Window two');
            expect(updateSource).toHaveBeenCalledWith(first);
            expect(updateSource).toHaveBeenCalledWith(second);
            expect((await clients[0].getNoteDetailsAsync(first.id)).noteTitle).toBe(first.title);
            expect((await clients[1].getNoteDetailsAsync(second.id)).noteTitle).toBe(second.title);
        }

        it('routes tag saves through the main window and exposes tags in note details', async () => {
            const note = addNote(false, 'Content');
            expect((await clients[0].getNoteDetailsAsync(note.id)).tags).toEqual([]);

            expect(await clients[0].saveNoteTagsAsync(note.id, [' Work ', 'work'])).toBe(Operation.Success);
            expect((await clients[0].getNoteDetailsAsync(note.id)).tags).toEqual(['Work']);
            expect((await clients[1].getNoteDetailsAsync(note.id)).tags).toEqual(['Work']);
            expect(saveSource).toHaveBeenCalled();
        });

        it('preserves tags when moving a note to another collection', async () => {
            const note = addNote(true, 'Content');
            note.tags = ['work', 'project alpha'];

            expect(await service.moveNotesToCollectionAsync([note.id], 'destination')).toBe(1);
            expect(destinationNotes[0].tags).toEqual(note.tags);
            expect(destinationNotes[0].tags).not.toBe(note.tags);
        });

        it('keeps two clients on the source during destination loading and copying', async () => {
            const moved = addNote(true, 'Moved content');
            const first = addNote(false, 'First');
            const second = addNote(false, 'Second');
            let loaded: (store: CollectionDataStoreAccess) => void;
            openDestination.mockReturnValue(new Promise<CollectionDataStoreAccess>((resolve) => (loaded = resolve)));
            const copyingStarted = new Promise<void>((resolve) => {
                saveContent.mockImplementation(() => {
                    resolve();
                    return new Promise<void>((finish) => (finishCopy = finish));
                });
            });
            let finishCopy: () => void;
            const moving = service.moveNotesToCollectionAsync([moved.id], 'destination');
            await Promise.resolve();
            await saveFromBothWindows(first, second);
            expect(deleteNote).not.toHaveBeenCalled();

            loaded(destination.object);
            await copyingStarted;
            await saveFromBothWindows(first, second);
            expect(saveContent).toHaveBeenCalledWith('destination-0', 'Moved content', 'destination', true);
            expect(destinationNotes[0].title).toBe('New note (Moved)');
            expect(deleteNote).not.toHaveBeenCalled();
            finishCopy();

            expect(await moving).toBe(1);
            expect(deleteNote).toHaveBeenCalledWith(moved.id);
            expect(saveDestination.mock.invocationCallOrder[0]).toBeLessThan(deleteNote.mock.invocationCallOrder[0]);
            expect(saveSource).toHaveBeenCalled();
            expect(service.activeCollection).toBe('collection');
        });

        it.each(['load', 'content', 'save'])('preserves source access and notes after a destination %s failure', async (stage) => {
            const moved = addNote(false, 'Content');
            const first = addNote(false, 'First');
            const second = addNote(false, 'Second');
            const failing = stage === 'load' ? openDestination : stage === 'content' ? saveContent : saveDestination;
            failing.mockRejectedValueOnce(new Error('Destination failure'));

            expect(await service.moveNotesToCollectionAsync([moved.id], 'destination')).toBe(0);

            expect(deleteNote).not.toHaveBeenCalled();
            expect(deleteFiles).not.toHaveBeenCalled();
            expect(logError).toHaveBeenCalled();
            await saveFromBothWindows(first, second);
            expect(await service.moveNotesToCollectionAsync([moved.id], 'destination')).toBe(1);
        });

        it('rejects overlapping moves and collection changes', async () => {
            const moved = addNote(false, 'Content');
            let loaded: (store: CollectionDataStoreAccess) => void;
            openDestination.mockReturnValue(new Promise<CollectionDataStoreAccess>((resolve) => (loaded = resolve)));
            const moving = service.moveNotesToCollectionAsync([moved.id], 'destination');
            await Promise.resolve();

            expect(await service.moveNotesToCollectionAsync([moved.id], 'destination')).toBe(0);
            expect(await service.activateCollection('another')).toBe(Operation.Error);
            expect(await service.addCollectionAsync('another')).toBe(Operation.Error);
            expect(await service.renameCollectionAsync('collection', 'another')).toBe(Operation.Error);
            expect(await service.deleteCollectionAsync('collection')).toBe(Operation.Error);
            await service.setNoteOpenAsync(moved.id, true);
            expect(service.noteIsOpen(moved.id)).toBe(false);
            expect(service.activeCollection).toBe('collection');
            expect(openDestination).toHaveBeenCalledTimes(1);

            loaded(destination.object);
            expect(await moving).toBe(1);
        });

        it('saves and closes a moved note before snapshotting its content', async () => {
            const moved = addNote(true, 'Old content');
            await service.setNoteOpenAsync(moved.id, true);
            clients[0].prepareNoteDeletion$.subscribe(({ noteId, callback }) => {
                if (noteId === moved.id) {
                    contents.set(noteId, 'Latest content');
                    clients[0].setNoteOpen(noteId, false);
                    callback(Operation.Success);
                }
            });

            expect(await service.moveNotesToCollectionAsync([moved.id], 'destination')).toBe(1);
            expect(saveContent).toHaveBeenCalledWith('destination-0', 'Latest content', 'destination', true);
        });

        it('waits for both windows to save and close before changing the active collection', async () => {
            const first = addNote(false, 'First');
            const second = addNote(false, 'Second');
            await service.setNoteOpenAsync(first.id, true);
            await service.setNoteOpenAsync(second.id, true);
            let acknowledge: () => void;
            const secondRequested = new Promise<void>((resolve) => {
                clients[1].prepareNoteDeletion$.subscribe(({ noteId, callback }) => {
                    if (noteId === second.id) {
                        acknowledge = () => {
                            clients[1].setNoteOpen(noteId, false);
                            callback(Operation.Success);
                        };
                        resolve();
                    }
                });
            });
            clients[0].prepareNoteDeletion$.subscribe(({ noteId, callback }) => {
                if (noteId === first.id) {
                    clients[0].setNoteOpen(noteId, false);
                    callback(Operation.Success);
                }
            });
            const changing = service.activateCollection('another');
            await secondRequested;
            await saveFromBothWindows(first, second);
            expect(service.activeCollection).toBe('collection');
            expect(saveSource).not.toHaveBeenCalled();
            await service.setNoteOpenAsync('another-note', true);
            expect(service.noteIsOpen('another-note')).toBe(false);

            acknowledge();
            expect(await changing).toBe(Operation.Success);
            expect(service.activeCollection).toBe('another');
            expect(saveSource).toHaveBeenCalledTimes(1);
            expect(service.hasOpenNotes()).toBe(false);
        });

        it('keeps the active collection when a window cannot save before switching', async () => {
            const note = addNote(false, 'Content');
            await service.setNoteOpenAsync(note.id, true);
            clients[0].prepareNoteDeletion$.subscribe(({ callback }) => callback(Operation.Error));

            expect(await service.activateCollection('another')).toBe(Operation.Error);
            expect(service.activeCollection).toBe('collection');
            expect(saveSource).not.toHaveBeenCalled();
            expect(logError).toHaveBeenCalled();
        });

        it('keeps the active collection when flushing its database fails', async () => {
            saveSource.mockRejectedValueOnce(new Error('Cannot persist source'));

            expect(await service.activateCollection('another')).toBe(Operation.Error);
            expect(service.activeCollection).toBe('collection');
            expect(logError).toHaveBeenCalled();
            expect(await service.activateCollection('another')).toBe(Operation.Success);
        });

        it('flushes partial destination writes before releasing a failed move', async () => {
            const moved = addNote(false, 'Content');
            saveContent.mockRejectedValueOnce(new Error('Cannot copy'));
            let flushed: () => void;
            const flushingStarted = new Promise<void>((resolve) => {
                saveDestination.mockImplementationOnce(() => {
                    resolve();
                    return new Promise<void>((finish) => (flushed = finish));
                });
            });
            const moving = service.moveNotesToCollectionAsync([moved.id], 'destination');
            await flushingStarted;

            expect(await service.activateCollection('destination')).toBe(Operation.Error);
            expect(deleteNote).not.toHaveBeenCalled();
            flushed();
            expect(await moving).toBe(0);
            expect(await service.activateCollection('destination')).toBe(Operation.Success);
        });

        it('does not close windows for an invalid or duplicate collection change', async () => {
            const note = addNote(false, 'Content');
            await service.setNoteOpenAsync(note.id, true);
            const close = jest.fn();
            clients[0].prepareNoteDeletion$.subscribe(close);
            files.setup((x) => x.getCollectionsAsync()).returns(async () => ['existing']);

            expect(await service.addCollectionAsync('')).toBe(Operation.Error);
            expect(await service.addCollectionAsync('existing')).toBe(Operation.Duplicate);
            expect(await service.renameCollectionAsync('collection', 'collection')).toBe(Operation.Aborted);
            expect(close).not.toHaveBeenCalled();
            expect(saveSource).not.toHaveBeenCalled();
            expect(service.noteIsOpen(note.id)).toBe(true);
        });

        it('does not report success when source deletion fails', async () => {
            const moved = addNote(false, 'Content');
            deleteFiles.mockRejectedValue(new Error('Cannot delete source'));

            expect(await service.moveNotesToCollectionAsync([moved.id], 'destination')).toBe(0);
            expect(deleteNote).not.toHaveBeenCalled();
            expect(logError).toHaveBeenCalled();
        });
    });
});
