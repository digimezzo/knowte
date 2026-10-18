import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BrowserWindow, WebContents } from 'electron';
import { of, Subject } from 'rxjs';
import { It, Mock } from 'typemoq';
import { Operation } from '../../common/enums/operation';
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
import { INoteEditor } from './note-editor/i-note-editor';
import { NoteComponent } from './note.component';

jest.mock('@electron/remote', () => ({ getGlobal: () => ({ on: jest.fn(), emit: jest.fn() }) }));
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
    let openSheet: jest.Mock;
    let sheetDismissed: Subject<NoteAction | undefined>;

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
        search.setup((x) => x.searchTextChanged$).returns(() => new Subject<string>());
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
        component = new NoteComponent(
            mock(), zone.object, dialog, mock(), mock(), translator.object, mock(), persistance.object,
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
        webContents.setup((x) => x.findInPage(It.isAnyString())).returns(findInPage);
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
            expect(findInPage).toHaveBeenCalledWith('work');
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
                expect(findInPage).toHaveBeenCalledWith('meeting');
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

    it('saves content and acknowledges success before closing the window', async () => {
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
