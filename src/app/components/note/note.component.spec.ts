import { NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BrowserWindow } from 'electron';
import { Subject } from 'rxjs';
import { It, Mock } from 'typemoq';
import { Operation } from '../../common/enums/operation';
import { Scheduler } from '../../common/scheduling/scheduler';
import { BaseSettings } from '../../common/settings/base-settings';
import { TasksCount } from '../../common/ui/tasks-count';
import { CollectionClient } from '../../services/collection/collection.client';
import { PersistanceService } from '../../services/persistance/persistance.service';
import { SearchClient } from '../../services/search/search.client';
import { TranslatorService } from '../../services/translator/translator.service';
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

    function mock<T>(): T {
        return Mock.ofType<T>().object;
    }

    beforeEach(() => {
        client = new CollectionClient(mock<Scheduler>());
        saveText = jest.spyOn(client, 'saveNoteTextAsync').mockResolvedValue(Operation.Success);
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
        const dialog = Mock.ofType<MatDialog>();
        showDialog = jest.fn();
        dialog.setup((x) => x.open(It.isAny(), It.isAny())).callback(showDialog);
        component = new NoteComponent(
            mock(), zone.object, dialog.object, mock(), mock(), translator.object, mock(), persistance.object,
            mock<BaseSettings>(), mock(), mock(), mock(), mock(), client, search.object, mock(), mock(), mock(),
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
        component['noteWindow'] = window.object;
        component['addSubscriptions']();
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
});
