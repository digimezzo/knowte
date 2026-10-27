import { NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserWindow, WebContents } from 'electron';
import { of, Subject } from 'rxjs';
import { It, Mock } from 'typemoq';
import { Operation } from '../../common/enums/operation';
import { Logger } from '../../common/logging/logger';
import { Scheduler } from '../../common/scheduling/scheduler';
import { BaseSettings } from '../../common/settings/base-settings';
import { TasksCount } from '../../common/ui/tasks-count';
import { CollectionClient } from '../../services/collection/collection.client';
import { PersistanceService } from '../../services/persistance/persistance.service';
import { SearchClient } from '../../services/search/search.client';
import { TranslatorService } from '../../services/translator/translator.service';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
import { InputDialogComponent } from '../dialogs/input-dialog/input-dialog.component';
import { ActionsBottomSheetComponent, NoteAction } from './bottom-sheets/actions-bottom-sheet/actions-bottom-sheet.component';
import { SearchBottomSheetComponent } from './bottom-sheets/search-bottom-sheet/search-bottom-sheet.component';
import { INoteEditor } from './note-editor/i-note-editor';
import { NoteComponent } from './note.component';

jest.mock('@electron/remote', () => ({ getGlobal: () => ({ on: jest.fn(), emit: jest.fn(), removeListener: jest.fn() }) }));
jest.mock('electron', () => ({ ipcRenderer: { on: jest.fn(), send: jest.fn() } }));
jest.mock('./note-editor/note-editor-factory', () => ({ NoteEditorFactory: class {} }));
jest.mock('../../services/temporary-storage/temporary-storage.service', () => ({ TemporaryStorageService: class {} }));
jest.mock('nanoid', () => ({ nanoid: () => 'note-id' }));

describe('NoteComponent preparing deletion', () => {
    let component: NoteComponent;
    let client: CollectionClient;
    let saveText: jest.SpyInstance;
    let writeContent: jest.Mock;
    let closeWindow: jest.Mock;
    let showDialog: jest.Mock;
    let saveTags: jest.SpyInstance;
    let dialogConfirmed: boolean;
    let inputDialogRef: MatDialogRef<InputDialogComponent>;
    let findInPage: jest.Mock;
    let stopFindInPage: jest.Mock;
    let searchTextChanged: Subject<string>;
    let openSheet: jest.Mock;
    let sheetDismissed: Subject<NoteAction | undefined>;
    let logWarning: jest.Mock;

    function mock<T>(): T {
        return Mock.ofType<T>().object;
    }

    beforeEach(() => {
        client = new CollectionClient(mock<Scheduler>());
        saveText = jest.spyOn(client, 'saveNoteTextAsync').mockResolvedValue(Operation.Success);
        saveTags = jest.spyOn(client, 'saveNoteTagsAsync').mockResolvedValue(Operation.Success);
        jest.spyOn(client, 'setNoteOpen').mockImplementation(() => undefined);
        const persistance = Mock.ofType<PersistanceService>();
        writeContent = jest.fn().mockResolvedValue(undefined);
        persistance.setup((x) => x.updateNoteContentAsync(It.isAny(), It.isAny(), It.isAny(), It.isAny(), It.isAny()))
            .returns(writeContent);
        const translator = Mock.ofType<TranslatorService>();
        translator.setup((x) => x.getAsync(It.isAny(), It.isAny())).returns(async () => 'Error');
        const zone = Mock.ofType<NgZone>();
        zone.setup((x) => x.run(It.isAny())).returns((callback: () => void) => callback());
        const search = Mock.ofType<SearchClient>();
        searchTextChanged = new Subject<string>();
        search.setup((x) => x.searchTextChanged$).returns(() => searchTextChanged);
        showDialog = jest.fn();
        dialogConfirmed = true;
        const dialogRef = Mock.ofType<MatDialogRef<InputDialogComponent>>();
        dialogRef.setup((x) => x.afterClosed()).returns(() => of(dialogConfirmed));
        inputDialogRef = dialogRef.object;
        showDialog.mockReturnValue(inputDialogRef);
        sheetDismissed = new Subject<NoteAction | undefined>();
        const sheetRef = Mock.ofType<MatBottomSheetRef<ActionsBottomSheetComponent, NoteAction>>();
        sheetRef.setup((x) => x.afterDismissed()).returns(() => sheetDismissed);
        openSheet = jest.fn().mockReturnValue(sheetRef.object);
        const dialog = TestBed.configureTestingModule({
            providers: [
                { provide: MatDialog, useValue: { open: showDialog } },
                { provide: MatBottomSheet, useValue: { open: openSheet } },
            ],
        }).inject(MatDialog);
        const settings = Mock.ofType<BaseSettings>();
        settings.setup((x) => x.closeNotesWithEscape).returns(() => true);
        const logger = Mock.ofType<Logger>();
        logWarning = jest.fn();
        logger.setup((x) => x.warn(It.isAnyString(), It.isAnyString(), It.isAnyString())).callback(logWarning);
        component = new NoteComponent(
            mock(), zone.object, dialog, logger.object, mock(), translator.object, mock(), persistance.object,
            settings.object, mock(), mock(), mock(), mock(), client, search.object, TestBed.inject(MatBottomSheet), mock(),
        );
        component.noteId = 'note-id';
        component['hasLoadedNoteContent'] = true;
        const editor = Mock.ofType<INoteEditor>();
        editor.setup((x) => x.text).returns(() => 'Text');
        editor.setup((x) => x.content).returns(() => '{"ops":[{"insert":"Text\\n"}]}');
        editor.setup((x) => x.getTasksCount()).returns(() => new TasksCount(0, 0));
        editor.setup((x) => x.noteContentChanged$).returns(() => new Subject<void>());
        component.noteEditor = editor.object;
        const window = Mock.ofType<BrowserWindow>();
        closeWindow = jest.fn();
        window.setup((x) => x.close()).callback(closeWindow);
        const webContents = Mock.ofType<WebContents>();
        findInPage = jest.fn();
        stopFindInPage = jest.fn();
        webContents.setup((x) => x.findInPage(It.isAnyString(), It.isAny())).returns(findInPage);
        webContents.setup((x) => x.stopFindInPage(It.isAny())).callback(stopFindInPage);
        window.setup((x) => x.webContents).returns(() => webContents.object);
        component['noteWindow'] = window.object;
        jest.spyOn(component, 'clearSearch').mockImplementation(() => undefined);
        component['addSubscriptions']();
    });

    it('saves dirty content for backup without closing or blocking the note window', async () => {
        component['isTextDirty'] = true;
        component.noteTitle = 'Saved note';
        const result = await new Promise<string>((resolve) => {
            client['prepareNoteBackup'].next({ noteId: 'note-id', callback: resolve });
        });
        expect(JSON.parse(result)).toEqual({ revision: 0, title: 'Saved note' });
        expect(writeContent).toHaveBeenCalledTimes(1);
        expect(component.isBusy).toBe(false);
        expect(closeWindow).not.toHaveBeenCalled();
    });

    it('does not rewrite a clean note during backup checkpoints', async () => {
        const result = await new Promise<string>((resolve) => {
            client['prepareNoteBackup'].next({ noteId: 'note-id', callback: resolve });
        });
        expect(JSON.parse(result).error).toBeUndefined();
        expect(writeContent).not.toHaveBeenCalled();
    });

    it.each(['metadata', 'content', 'exception'])('logs backup-triggered %s save failures without a popup and permits retry', async (failure) => {
        component['isTextDirty'] = true;
        if (failure === 'metadata') {
            saveText.mockResolvedValueOnce(Operation.Error);
        } else if (failure === 'exception') {
            saveText.mockRejectedValueOnce(new Error('Metadata unavailable'));
        } else {
            writeContent.mockRejectedValueOnce(new Error('Cannot write'));
        }
        const prepare = () => new Promise<string>((resolve) => {
            client['prepareNoteBackup'].next({ noteId: 'note-id', callback: resolve });
        });

        expect(JSON.parse(await prepare()).error).toBeDefined();
        expect(logWarning).toHaveBeenCalledWith(
            expect.stringContaining('Could not prepare note for backup'), 'NoteComponent', 'prepareNoteBackup',
        );
        expect(showDialog).not.toHaveBeenCalled();
        expect(closeWindow).not.toHaveBeenCalled();
        expect(component['isTextDirty']).toBe(true);
        expect(component['pendingContentSave']).toBeUndefined();

        expect(JSON.parse(await prepare()).error).toBeUndefined();
        expect(component['isTextDirty']).toBe(false);
        expect(showDialog).not.toHaveBeenCalled();
    });

    it('still displays save errors outside backup preparation', async () => {
        component['isTextDirty'] = true;
        writeContent.mockRejectedValueOnce(new Error('Cannot write'));

        expect(await component['saveNoteContentAsync']()).toBe(Operation.Error);
        expect(showDialog).toHaveBeenCalledWith(ErrorDialogComponent, expect.anything());
        expect(component['isTextDirty']).toBe(true);
    });

    it('waits for normal title autosave instead of competing with title edits', async () => {
        component['isTitleDirty'] = true;
        const result = await new Promise<string>((resolve) => {
            client['prepareNoteBackup'].next({ noteId: 'note-id', callback: resolve });
        });
        expect(JSON.parse(result).error).toContain('title');
        expect(writeContent).not.toHaveBeenCalled();
        expect(component['isTitleDirty']).toBe(true);
    });

    it('rejects a backup checkpoint when note content changes during saving', async () => {
        component['isTextDirty'] = true;
        writeContent.mockImplementation(async () => component['onNoteContentChange']());
        const result = await new Promise<string>((resolve) => {
            client['prepareNoteBackup'].next({ noteId: 'note-id', callback: resolve });
        });
        expect(JSON.parse(result).error).toContain('changed');
        expect(closeWindow).not.toHaveBeenCalled();
    });

    it.each([
        ['search', 'openSearchBottomSheet'],
        ['tags', 'editTagsAsync'],
        ['share', 'openShareBottomSheet'],
        ['pin', 'toggleNotePin'],
        ['mark', 'toggleNoteMark'],
        ['encrypt', 'encryptNoteAsync'],
        ['decrypt', 'decryptNoteAsync'],
        ['delete', 'deleteNoteAsync'],
    ] as const)('runs %s only after the action sheet has finished dismissing', async (action, method) => {
        const handler = jest.spyOn(component, method).mockImplementation(() => undefined);
        const opening = component.openActionsBottomSheet();
        await Promise.resolve();

        expect(openSheet).toHaveBeenCalledWith(ActionsBottomSheetComponent, expect.objectContaining({
            panelClass: 'note-actions-sheet',
            data: {
                isPinned: component.isPinned, isMarked: component.isMarked,
                isEncrypted: component.isEncrypted, isTrashed: component.isTrashed,
            },
        }));
        expect(handler).not.toHaveBeenCalled();
        expect(component.isActionsSheetOpen).toBe(true);
        sheetDismissed.next(action);
        expect(handler).not.toHaveBeenCalled();
        sheetDismissed.complete();
        await opening;

        expect(component.isActionsSheetOpen).toBe(false);
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('dismisses with Escape without closing the note when close-with-Escape is enabled', async () => {
        const opening = component.openActionsBottomSheet();
        await Promise.resolve();
        component['handleEscape']();
        expect(closeWindow).not.toHaveBeenCalled();

        sheetDismissed.next(undefined);
        sheetDismissed.complete();
        await opening;
        expect(component.isActionsSheetOpen).toBe(false);
        component['handleEscape']();
        expect(closeWindow).toHaveBeenCalledTimes(1);
    });

    it('does not open duplicate action sheets or open them while busy', async () => {
        component.isBusy = true;
        await component.openActionsBottomSheet();
        expect(openSheet).not.toHaveBeenCalled();
        component.isBusy = false;
        const first = component.openActionsBottomSheet();
        const second = component.openActionsBottomSheet();
        await second;
        expect(openSheet).toHaveBeenCalledTimes(1);
        sheetDismissed.complete();
        await first;
    });

    it('does not delete a trashed note', async () => {
        component.isTrashed = true;
        const remove = jest.spyOn(component, 'deleteNoteAsync').mockResolvedValue(undefined);
        const opening = component.openActionsBottomSheet();
        await Promise.resolve();
        sheetDismissed.next('delete');
        sheetDismissed.complete();
        await opening;
        expect(remove).not.toHaveBeenCalled();
    });

    it('edits comma-separated tags using the existing input dialog', async () => {
        component.tags = ['original'];
        showDialog.mockImplementation((type, config) => {
            expect(type).toBe(InputDialogComponent);
            expect(config.data.inputText).toBe('original');
            expect(config.data.allowEmpty).toBe(true);
            config.data.inputText = ' Work, work, project alpha, ';
            return inputDialogRef;
        });

        await component.editTagsAsync();

        expect(saveTags).toHaveBeenCalledWith('note-id', ['Work', 'project alpha']);
        expect(component.tags).toEqual(['Work', 'project alpha']);
        expect(component.isBusy).toBe(false);
    });

    it('can clear all tags', async () => {
        component.tags = ['work'];
        showDialog.mockImplementation((_type, config) => {
            config.data.inputText = '';
            return inputDialogRef;
        });

        await component.editTagsAsync();

        expect(saveTags).toHaveBeenCalledWith('note-id', []);
        expect(component.tags).toEqual([]);
    });

    it('does not change tags when the dialog is cancelled', async () => {
        component.tags = ['original'];
        dialogConfirmed = false;

        await component.editTagsAsync();

        expect(saveTags).not.toHaveBeenCalled();
        expect(component.tags).toEqual(['original']);
        expect(component.isBusy).toBe(false);
    });

    it('keeps the previous tags and displays an error if saving fails', async () => {
        component.tags = ['original'];
        saveTags.mockResolvedValue(Operation.Error);

        await component.editTagsAsync();

        expect(component.tags).toEqual(['original']);
        expect(showDialog).toHaveBeenLastCalledWith(ErrorDialogComponent, expect.anything());
        expect(component.isBusy).toBe(false);
    });

    it('blocks closing and collection moves until tag saving finishes', async () => {
        let finishSave: (operation: Operation) => void;
        const saveStarted = new Promise<void>((resolve) => {
            saveTags.mockImplementationOnce(() => {
                resolve();
                return new Promise<Operation>((finish) => { finishSave = finish; });
            });
        });
        const editing = component.editTagsAsync();
        await saveStarted;
        const event = { preventDefault: jest.fn(), returnValue: undefined };
        component.beforeunloadHandler(event);
        expect(event.preventDefault).toHaveBeenCalled();
        const callback = jest.fn();
        client['prepareNoteDeletion'].next({ noteId: 'note-id', callback });
        expect(callback).toHaveBeenCalledWith(Operation.Error);
        expect(closeWindow).not.toHaveBeenCalled();

        finishSave(Operation.Success);
        await editing;
        expect(component.isBusy).toBe(false);
    });

    it.each(['t:work', ' T:"project alpha" ', 't:', 't:work t:urgent'])('does not highlight tag queries in note contents: %s', (query) => {
        jest.useFakeTimers();
        try {
            component['searchText'] = query;
            component['applySearch']();
            jest.runAllTimers();
            expect(findInPage).not.toHaveBeenCalled();
            expect(component.clearSearch).toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
        }
    });

    it('keeps ordinary in-note search highlighting', () => {
        jest.useFakeTimers();
        try {
            component['searchText'] = 'work meeting';
            component['applySearch']();
            jest.runAllTimers();
            expect(findInPage).toHaveBeenCalledWith('work', { forward: true, findNext: false });
            expect(window.getSelection().anchorNode).toBe(document.body);
            expect(window.getSelection().anchorOffset).toBe(0);
        } finally {
            jest.useRealTimers();
        }
    });

    it.each(['initial', 'updated'])('starts an %s search before the existing caret position', (source) => {
        jest.useFakeTimers();
        const editor = document.createElement('div');
        editor.contentEditable = 'true';
        editor.tabIndex = 0;
        editor.textContent = 'work first, work last';
        document.body.appendChild(editor);
        editor.focus();
        window.getSelection().collapse(editor.firstChild, editor.textContent.length);
        findInPage.mockImplementation(() => {
            expect(window.getSelection().anchorNode).toBe(document.body);
            expect(window.getSelection().anchorOffset).toBe(0);
            expect(document.activeElement).not.toBe(editor);
        });
        try {
            if (source === 'initial') {
                component['searchText'] = 'work';
                component['applySearch']();
            } else {
                searchTextChanged.next('work');
            }
            jest.runAllTimers();
            expect(findInPage).toHaveBeenCalledWith('work', { forward: true, findNext: false });
        } finally {
            editor.remove();
            window.getSelection().removeAllRanges();
            jest.useRealTimers();
        }
    });

    it('only scrolls for the latest pending search', () => {
        jest.useFakeTimers();
        try {
            searchTextChanged.next('old');
            searchTextChanged.next('latest');
            jest.runAllTimers();
            expect(findInPage).toHaveBeenCalledTimes(1);
            expect(findInPage).toHaveBeenCalledWith('latest', { forward: true, findNext: false });
        } finally {
            jest.useRealTimers();
        }
    });

    it('replaces an already active search without stopping native find-in-page', () => {
        jest.useFakeTimers();
        try {
            searchTextChanged.next('old');
            jest.runAllTimers();
            searchTextChanged.next('new');
            jest.runAllTimers();

            expect(findInPage.mock.calls).toEqual([
                ['old', { forward: true, findNext: false }],
                ['new', { forward: true, findNext: false }],
            ]);
            expect(stopFindInPage).not.toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
        }
    });

    it('updates and clears renderer-owned highlights without using native find', () => {
        jest.useFakeTimers();
        const find = jest.spyOn(component['noteSearch'], 'find').mockReturnValue(true);
        const clear = jest.spyOn(component['noteSearch'], 'clear');
        (component.clearSearch as jest.Mock).mockRestore();
        try {
            searchTextChanged.next('old');
            jest.runAllTimers();
            searchTextChanged.next('new');
            jest.runAllTimers();
            expect(find.mock.calls).toEqual([['old'], ['new']]);
            expect(findInPage).not.toHaveBeenCalled();

            searchTextChanged.next('');
            expect(clear).toHaveBeenCalledTimes(1);
            expect(component['searchText']).toBe('');
            expect(stopFindInPage).toHaveBeenCalledWith('clearSelection');
        } finally {
            jest.useRealTimers();
        }
    });

    it('does not scroll for a search that was cleared', () => {
        jest.useFakeTimers();
        (component.clearSearch as jest.Mock).mockRestore();
        try {
            searchTextChanged.next('work');
            component.clearSearch();
            jest.runAllTimers();
            expect(findInPage).not.toHaveBeenCalled();
            expect(stopFindInPage).toHaveBeenCalledWith('clearSelection');
        } finally {
            jest.useRealTimers();
        }
    });

    it('cancels pending search scrolling when the note closes', () => {
        jest.useFakeTimers();
        try {
            searchTextChanged.next('work');
            component['cleanup']();
            jest.runAllTimers();
            expect(findInPage).not.toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
        }
    });

    it.each(['t:work meeting budget', 't:"project alpha" meeting budget', 't:work t:urgent meeting budget'])(
        'highlights only the text portion of a combined query: %s', (query) => {
            jest.useFakeTimers();
            try {
                component['searchText'] = query;
                component['applySearch']();
                jest.runAllTimers();
                expect(findInPage).toHaveBeenCalledWith('meeting', { forward: true, findNext: false });
            } finally {
                jest.useRealTimers();
            }
        },
    );

    it('prefills in-note search with only the title/content query', () => {
        component['searchText'] = 't:"project alpha" t:urgent meeting budget';
        component.openSearchBottomSheet();
        expect(openSheet).toHaveBeenCalledWith(expect.anything(), {
            data: { searchText: 'meeting budget' },
        });
    });

    it('replaces the previous search with the query returned by the search sheet', () => {
        jest.useFakeTimers();
        const dismissed = new Subject<string | undefined>();
        const sheet = Mock.ofType<MatBottomSheetRef<SearchBottomSheetComponent, string>>();
        sheet.setup((x) => x.afterDismissed()).returns(() => dismissed);
        openSheet.mockReturnValue(sheet.object);
        component['searchText'] = 'old';
        try {
            component.openSearchBottomSheet();
            expect(findInPage).not.toHaveBeenCalled();
            dismissed.next('new');
            dismissed.complete();
            jest.runAllTimers();

            expect(component['searchText']).toBe('new');
            expect(findInPage).toHaveBeenCalledWith('new', { forward: true, findNext: false });
            expect(window.getSelection().anchorNode).toBe(document.body);
            component.openSearchBottomSheet();
            expect(openSheet).toHaveBeenLastCalledWith(SearchBottomSheetComponent, { data: { searchText: 'new' } });
        } finally {
            jest.useRealTimers();
        }
    });

    it.each([undefined, ''])('handles a search sheet dismissed with %s', (query) => {
        const dismissed = new Subject<string | undefined>();
        const sheet = Mock.ofType<MatBottomSheetRef<SearchBottomSheetComponent, string>>();
        sheet.setup((x) => x.afterDismissed()).returns(() => dismissed);
        openSheet.mockReturnValue(sheet.object);
        component['searchText'] = 'old';

        component.openSearchBottomSheet();
        dismissed.next(query);
        dismissed.complete();

        expect(component['searchText']).toBe(query === undefined ? 'old' : '');
        expect(findInPage).not.toHaveBeenCalled();
        if (query === '') {
            expect(component.clearSearch).toHaveBeenCalled();
        }
    });

    it('saves content and acknowledges success before closing the window', async () => {
        const dispose = jest.spyOn(client, 'dispose');
        const callback = jest.fn();
        const acknowledged = new Promise<Operation>((resolve) => {
            client['prepareNoteDeletion'].next({
                noteId: 'note-id',
                callback: (operation: Operation) => {
                    expect(writeContent).toHaveBeenCalledTimes(1);
                    expect(closeWindow).not.toHaveBeenCalled();
                    callback(operation);
                    resolve(operation);
                },
            });
        });

        expect(await acknowledged).toBe(Operation.Success);
        expect(callback).toHaveBeenCalledWith(Operation.Success);
        expect(closeWindow).toHaveBeenCalledTimes(1);
        expect(dispose).toHaveBeenCalled();
        expect(dispose.mock.invocationCallOrder[0]).toBeLessThan(closeWindow.mock.invocationCallOrder[0]);
    });

    it('ignores a delayed close while deletion is saving', async () => {
        let finishWrite: () => void;
        const started = new Promise<void>((resolve) => {
            writeContent.mockImplementationOnce(() => {
                resolve();
                return new Promise<void>((finish) => { finishWrite = finish; });
            });
        });
        const acknowledged = new Promise<Operation>((resolve) => {
            client['prepareNoteDeletion'].next({ noteId: 'note-id', callback: resolve });
        });
        await started;

        await component['saveAndCloseAsync']();
        expect(closeWindow).not.toHaveBeenCalled();
        expect(saveText).toHaveBeenCalledTimes(1);

        finishWrite();
        expect(await acknowledged).toBe(Operation.Success);
        expect(closeWindow).toHaveBeenCalledTimes(1);
        expect(writeContent).toHaveBeenCalledTimes(1);
    });

    it('keeps the window open and reports errors when writing content fails', async () => {
        writeContent.mockRejectedValue(new Error('Cannot write'));
        const acknowledged = new Promise<Operation>((resolve) => {
            client['prepareNoteDeletion'].next({ noteId: 'note-id', callback: resolve });
        });

        expect(await acknowledged).toBe(Operation.Error);
        expect(showDialog).toHaveBeenCalled();
        expect(closeWindow).not.toHaveBeenCalled();
        expect(component.isBusy).toBe(false);
    });

    it('does not overwrite content that has not loaded successfully', async () => {
        component['hasLoadedNoteContent'] = false;
        const acknowledged = new Promise<Operation>((resolve) => {
            client['prepareNoteDeletion'].next({ noteId: 'note-id', callback: resolve });
        });

        expect(await acknowledged).toBe(Operation.Error);
        expect(writeContent).not.toHaveBeenCalled();
        expect(closeWindow).not.toHaveBeenCalled();
    });

    it('serializes content writes so an older autosave cannot overwrite the deletion-time save', async () => {
        let finishFirstWrite: () => void;
        const firstWriteStarted = new Promise<void>((resolve) => {
            writeContent.mockImplementationOnce(() => {
                resolve();
                return new Promise<void>((finish) => { finishFirstWrite = finish; });
            });
        });
        const firstSave = component['saveNoteContentAsync']();
        await firstWriteStarted;
        const finalSave = component['saveNoteContentAsync']();
        await Promise.resolve();

        expect(saveText).toHaveBeenCalledTimes(1);
        finishFirstWrite();
        expect(await firstSave).toBe(Operation.Success);
        expect(await finalSave).toBe(Operation.Success);
        expect(writeContent).toHaveBeenCalledTimes(2);
    });

    it('cancels pending autosaves after preparing deletion', async () => {
        jest.useFakeTimers();
        try {
            component.noteContentChanged.next();
            const acknowledged = new Promise<Operation>((resolve) => {
                client['prepareNoteDeletion'].next({ noteId: 'note-id', callback: resolve });
            });
            expect(await acknowledged).toBe(Operation.Success);

            jest.runAllTimers();
            await Promise.resolve();

            expect(writeContent).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('keeps edits dirty when the user types during a slow save', async () => {
        let finishWrite: () => void;
        const started = new Promise<void>((resolve) => {
            writeContent.mockImplementationOnce(() => {
                resolve();
                return new Promise<void>((finish) => { finishWrite = finish; });
            });
        });
        component['isTextDirty'] = true;
        const save = component['saveNoteContentAsync']();
        await started;
        component['onNoteContentChange']();
        finishWrite();

        expect(await save).toBe(Operation.Success);
        expect(component['isTextDirty']).toBe(true);
        expect(component['pendingContentSave']).toBeUndefined();
        expect(await component['saveNoteContentAsync']()).toBe(Operation.Success);
        expect(component['isTextDirty']).toBe(false);
        component['removeSubscriptions']();
    });

    it('prevents closing during a pending save even if there are no dirty flags', async () => {
        let finishWrite: () => void;
        const started = new Promise<void>((resolve) => {
            writeContent.mockImplementationOnce(() => {
                resolve();
                return new Promise<void>((finish) => { finishWrite = finish; });
            });
        });
        const save = component['saveNoteContentAsync']();
        await started;
        const event = { preventDefault: jest.fn(), returnValue: undefined };
        component.beforeunloadHandler(event);
        expect(event.preventDefault).toHaveBeenCalled();
        component['removeSubscriptions']();
        finishWrite();
        await save;
    });

    it('retains dirty flags when closing to save and the write fails', async () => {
        component['isTextDirty'] = true;
        const event = { preventDefault: jest.fn(), returnValue: undefined };
        component.beforeunloadHandler(event);
        component['removeSubscriptions']();
        expect(component['isTextDirty']).toBe(true);
        writeContent.mockRejectedValue(new Error('Cannot write'));

        expect(await component['saveNoteContentAsync']()).toBe(Operation.Error);
        expect(component['isTextDirty']).toBe(true);
        expect(component['pendingContentSave']).toBeUndefined();
    });

    it('saves a consistent content snapshot while metadata is being saved', async () => {
        let finishMetadata: (operation: Operation) => void;
        saveText.mockImplementationOnce(() => new Promise<Operation>((resolve) => { finishMetadata = resolve; }));
        const editor = Mock.ofType<INoteEditor>();
        let content = 'original content';
        editor.setup((x) => x.content).returns(() => content);
        editor.setup((x) => x.text).returns(() => 'original text');
        editor.setup((x) => x.getTasksCount()).returns(() => new TasksCount(0, 0));
        component.noteEditor = editor.object;

        const save = component['saveNoteContentAsync']();
        content = 'new content';
        component['onNoteContentChange']();
        finishMetadata(Operation.Success);

        expect(await save).toBe(Operation.Success);
        expect(writeContent.mock.calls[0][1]).toBe('original content');
        expect(component['isTextDirty']).toBe(true);
        component['removeSubscriptions']();
    });

    it('keeps the window open if further edits arrive during the close-time save', async () => {
        component['saveNoteTitleAsync'] = jest.fn().mockResolvedValue(Operation.Success);
        let finishWrite: () => void;
        const started = new Promise<void>((resolve) => {
            writeContent.mockImplementationOnce(() => {
                resolve();
                return new Promise<void>((finish) => { finishWrite = finish; });
            });
        });
        const close = component['saveAndCloseAsync']();
        await started;
        component['onNoteContentChange']();
        finishWrite();
        await close;

        expect(component['isTextDirty']).toBe(true);
        expect(closeWindow).not.toHaveBeenCalled();
        expect(component.isBusy).toBe(false);
        component['removeSubscriptions']();
    });
});

describe('SearchBottomSheetComponent searching', () => {
    it('returns the updated query to the note when submitting the search', () => {
        const sheet = Mock.ofType<MatBottomSheetRef<SearchBottomSheetComponent>>();
        const dismiss = jest.fn();
        sheet.setup((x) => x.dismiss(It.isAnyString())).callback(dismiss);
        const search = Mock.ofType<SearchClient>();
        const searchChanged = jest.fn();
        search.setup((x) => x.onSearchTextChanged(It.isAnyString())).callback(searchChanged);
        const component = new SearchBottomSheetComponent({}, sheet.object, search.object);
        component.searchText = 'work';

        component.performSearch();

        expect(dismiss).toHaveBeenCalledTimes(1);
        expect(dismiss).toHaveBeenCalledWith('work');
        expect(searchChanged).not.toHaveBeenCalled();
    });
});

describe('SearchBottomSheetComponent input events', () => {
    let fixture: ComponentFixture<SearchBottomSheetComponent>;
    let dismiss: jest.Mock;

    beforeEach(async () => {
        dismiss = jest.fn();
        await TestBed.configureTestingModule({
            declarations: [SearchBottomSheetComponent],
            imports: [FormsModule, NoopAnimationsModule, TranslateModule.forRoot()],
            providers: [
                { provide: MatBottomSheetRef, useValue: { dismiss } },
                { provide: SearchClient, useValue: { onSearchTextChanged: jest.fn() } },
                { provide: MAT_BOTTOM_SHEET_DATA, useValue: { searchText: 'old' } },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(SearchBottomSheetComponent);
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('selects the previous query when opened so typing replaces it', async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        const input: HTMLInputElement = fixture.nativeElement.querySelector('.notes-content-search-input');
        expect(document.activeElement).toBe(input);
        expect(input.selectionStart).toBe(0);
        expect(input.selectionEnd).toBe('old'.length);
    });

    it('submits the edited input on Enter keydown without waiting for keyup', async () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('.notes-content-search-input');
        expect(input.value).toBe('old');
        input.value = 'new query';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
        input.dispatchEvent(enter);

        expect(dismiss).toHaveBeenCalledTimes(1);
        expect(dismiss).toHaveBeenCalledWith('new query');
        expect(enter.defaultPrevented).toBe(true);
    });

    it('submits the edited input when the Search button is clicked', async () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('.notes-content-search-input');
        input.value = 'replacement';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        fixture.nativeElement.querySelector('app-accent-button').click();

        expect(dismiss).toHaveBeenCalledTimes(1);
        expect(dismiss).toHaveBeenCalledWith('replacement');
    });

    it('clears an active query through the clear control without dismissing the sheet', async () => {
        const search = TestBed.inject(SearchClient);
        const input: HTMLInputElement = fixture.nativeElement.querySelector('.notes-content-search-input');

        fixture.nativeElement.querySelector('button.notes-content-search-icons').click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(input.value).toBe('');
        expect(fixture.componentInstance.searchText).toBe('');
        expect(search.onSearchTextChanged).toHaveBeenCalledWith('');
        expect(dismiss).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(input);
    });
});
