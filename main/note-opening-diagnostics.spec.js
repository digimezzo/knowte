const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { EventEmitter } = require('events');
const typescript = require('typescript');

describe('Note opening diagnostics', () => {
    let api;
    let info;
    let now;
    let created;
    let schedule;

    beforeEach(() => {
        now = 0;
        created = [];
        schedule = jest.fn();
        info = jest.fn();
        const app = { commandLine: { appendSwitch: jest.fn() }, getPath: () => '/test', on: jest.fn() };
        class BrowserWindow extends EventEmitter {
            constructor() {
                super();
                this.webContents = Object.assign(new EventEmitter(), {
                    id: created.length + 1,
                    isCrashed: () => false,
                    setWindowOpenHandler: jest.fn(),
                    executeJavaScript: jest.fn(),
                });
                created.push(this);
            }
            isDestroyed() { return false; }
            loadURL() {}
            show() {}
            focus() {}
            setSize() {}
            center() {}
        }
        const logger = { create: jest.fn(), info, warn: jest.fn(), error: jest.fn(), transports: { file: {} } };
        const mocks = {
            electron: { app, BrowserWindow, ipcMain: { on: jest.fn(), handle: jest.fn() }, screen: {} },
            'electron-log': { default: logger },
            '@electron/remote/main': { initialize: jest.fn(), enable: jest.fn() },
            'electron-window-state': () => ({ width: 800, height: 500, manage: jest.fn() }),
            'fs-extra': { existsSync: () => false, watch: jest.fn() },
            './src/app/common/settings/settings-store': {
                SettingsStore: class { has() { return true; } get() { return false; } },
            },
            './main/backup-controller': { registerBackups: jest.fn() },
        };
        const source = fs.readFileSync(path.join(__dirname, '../main.ts'), 'utf8');
        const compiled = typescript.transpileModule(source, {
            compilerOptions: { module: typescript.ModuleKind.CommonJS, target: typescript.ScriptTarget.ES2017 },
        });
        api = vm.runInNewContext(compiled.outputText + `
            ({
                createNoteWindow,
                scheduleSpareNoteWindow,
                setEnabled: (enabled) => { noteOpenDiagnosticsEnabled = enabled; },
                setSpare: (spare) => { spareNoteWindow = spare; },
                setMainWindow: (window) => { mainWindow = window; }
            });`, {
            require: (name) => Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : require(name),
            exports: {}, process: { argv: [], env: {}, pid: 123 },
            global: {}, __dirname: path.join(__dirname, '..'),
            performance: { now: () => now },
            setTimeout: schedule, clearTimeout: jest.fn(), console,
        });
    });

    test('logs waiting for a loading spare and uses it after it finishes', async () => {
        api.setEnabled(true);
        let finishLoad;
        const spareWindow = {
            isDestroyed: () => false, webContents: {
                id: 17, isCrashed: () => false, executeJavaScript: jest.fn(),
            },
            setSize: jest.fn(), center: jest.fn(), show: jest.fn(), focus: jest.fn(),
        };
        api.setSpare({
            window: spareWindow, windowHasFrame: false, settingsSnapshot: '',
            isLoading: () => true, loaded: new Promise((resolve) => { finishLoad = resolve; }),
        });
        const opening = api.createNoteWindow('/test', 'note-1', false);
        expect(spareWindow.show).not.toHaveBeenCalled();
        expect(info).toHaveBeenCalledWith(expect.stringContaining('state=loading webContentsId=17'));
        now = 3200;
        finishLoad(true);
        await opening;
        expect(spareWindow.show).toHaveBeenCalledTimes(1);
        expect(created).toHaveLength(0);
        expect(info).toHaveBeenCalledWith(expect.stringContaining('wait=3200.0 ms'));
        expect(info).toHaveBeenCalledWith(expect.stringContaining('noteId=note-1 using spare webContentsId=17'));
    });

    test('logs scheduled spare startup and its loading milestones', () => {
        api.setEnabled(true);
        api.setMainWindow({});
        api.scheduleSpareNoteWindow(500);
        expect(info).toHaveBeenCalledWith(expect.stringContaining('spareId=1 scheduled delay=500 ms'));
        now = 500;
        schedule.mock.calls[0][0]();
        expect(created).toHaveLength(1);
        created[0].webContents.emit('did-start-loading');
        now = 750;
        created[0].webContents.emit('dom-ready');
        now = 1000;
        created[0].webContents.emit('did-finish-load');
        expect(info).toHaveBeenCalledWith(expect.stringContaining('spareId=1 window created webContentsId=1'));
        expect(info).toHaveBeenCalledWith(expect.stringContaining('spareId=1 dom-ready elapsed=750.0 ms'));
        expect(info).toHaveBeenCalledWith(expect.stringContaining('spareId=1 did-finish-load elapsed=1000.0 ms'));
    });

    test('logs the fresh window path and loading events when no spare exists', async () => {
        api.setEnabled(true);
        await api.createNoteWindow('/test', 'note-2', false);
        expect(created).toHaveLength(1);
        created[0].webContents.emit('dom-ready');
        created[0].webContents.emit('did-finish-load');
        expect(info).toHaveBeenCalledWith(expect.stringContaining('noteId=note-2 spare=unavailable'));
        expect(info).toHaveBeenCalledWith(expect.stringContaining('noteId=note-2 new window dom-ready'));
        expect(info).toHaveBeenCalledWith(expect.stringContaining('noteId=note-2 new window did-finish-load'));
    });

    test('logs a ready spare without creating a fresh window', async () => {
        api.setEnabled(true);
        const spareWindow = {
            isDestroyed: () => false,
            webContents: { id: 21, isCrashed: () => false, executeJavaScript: jest.fn() },
            setSize: jest.fn(), center: jest.fn(), show: jest.fn(), focus: jest.fn(),
        };
        api.setSpare({
            window: spareWindow, windowHasFrame: false, settingsSnapshot: '',
            isLoading: () => false, loaded: Promise.resolve(true),
        });
        await api.createNoteWindow('/test', 'note-4', false);
        expect(created).toHaveLength(0);
        expect(info).toHaveBeenCalledWith(expect.stringContaining('state=settled webContentsId=21'));
        expect(spareWindow.show).toHaveBeenCalledTimes(1);
    });

    test('logs a failed spare before opening a fresh window', async () => {
        api.setEnabled(true);
        const close = jest.fn();
        api.setSpare({
            window: { isDestroyed: () => false, webContents: { id: 22, isCrashed: () => false }, close },
            windowHasFrame: false, settingsSnapshot: '', isLoading: () => false, loaded: Promise.resolve(false),
        });
        await api.createNoteWindow('/test', 'note-5', false);
        expect(close).toHaveBeenCalledTimes(1);
        expect(created).toHaveLength(1);
        expect(info).toHaveBeenCalledWith(expect.stringContaining('noteId=note-5 spare rejected reason=failed to load'));
    });

    test('does not add diagnostic logs or load listeners when disabled', async () => {
        await api.createNoteWindow('/test', 'note-3', false);
        expect(info.mock.calls.some(([message]) => message.includes('[Performance] [noteOpen]'))).toBe(false);
        expect(created[0].webContents.listenerCount('dom-ready')).toBe(0);
    });
});
