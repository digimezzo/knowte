const fs = require('fs');
const path = require('path');
const vm = require('vm');
const typescript = require('typescript');

describe('Window recovery after display changes', () => {
    let screen;
    let windows;

    function createWindow(bounds, options = {}) {
        return {
            isDestroyed: () => !!options.destroyed,
            isVisible: () => !options.hidden,
            isMinimized: () => !!options.minimized,
            isMaximized: () => !!options.maximized,
            isFullScreen: () => !!options.fullScreen,
            getBounds: () => bounds,
            getNormalBounds: () => options.normalBounds || bounds,
            setBounds: jest.fn(),
            unmaximize: jest.fn(),
            maximize: jest.fn(),
            setFullScreen: jest.fn(),
        };
    }

    beforeEach(() => {
        windows = [];
        const primary = { workArea: { x: 0, y: 0, width: 1366, height: 728 } };
        screen = {
            getAllDisplays: jest.fn(() => [primary]),
            getDisplayMatching: jest.fn(() => primary),
            on: jest.fn(),
        };
        const app = {
            commandLine: { appendSwitch: jest.fn() },
            getPath: () => '/tmp/knowte-test',
            on: jest.fn(),
        };
        const logger = { create: jest.fn(), info: jest.fn(), transports: { file: {} } };
        const mocks = {
            electron: { app, screen, BrowserWindow: { getAllWindows: () => windows }, ipcMain: { on: jest.fn() } },
            'electron-log': { default: logger },
            '@electron/remote/main': { initialize: jest.fn() },
            'electron-store': {},
            'electron-window-state': {},
            'fs-extra': {},
        };
        const source = fs.readFileSync(path.join(__dirname, '../main.ts'), 'utf8');
        const compiled = typescript.transpileModule(source, {
            compilerOptions: { module: typescript.ModuleKind.CommonJS, target: typescript.ScriptTarget.ES2017 },
        });
        vm.runInNewContext(compiled.outputText, {
            require: (name) => Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : require(name),
            exports: {},
            process: { argv: [], env: {} },
            global: {},
            __dirname: path.join(__dirname, '..'),
            console,
        });
        const readyHandlers = app.on.mock.calls.filter(([event]) => event === 'ready');
        readyHandlers[1][1]();
    });

    function emitDisplayChange(event = 'display-removed') {
        const handler = screen.on.mock.calls.find(([name]) => name === event)[1];
        handler();
    }

    test('moves an open note from a disconnected monitor onto the remaining display', () => {
        const note = createWindow({ x: 1920, y: 100, width: 620, height: 400 });
        windows.push(note);
        emitDisplayChange();
        expect(note.setBounds).toHaveBeenCalledWith({ x: 746, y: 100, width: 620, height: 400 });
    });

    test('leaves windows overlapping a remaining display unchanged', () => {
        const note = createWindow({ x: 1000, y: 100, width: 620, height: 400 });
        windows.push(note);
        emitDisplayChange();
        expect(note.setBounds).not.toHaveBeenCalled();
    });

    test('handles negative display coordinates and windows larger than the work area', () => {
        const display = { workArea: { x: -1280, y: 40, width: 1280, height: 680 } };
        screen.getAllDisplays.mockReturnValue([display]);
        screen.getDisplayMatching.mockReturnValue(display);
        const note = createWindow({ x: 1920, y: 0, width: 1600, height: 900 });
        windows.push(note);
        emitDisplayChange('display-metrics-changed');
        expect(note.setBounds).toHaveBeenCalledWith({ x: -1280, y: 40, width: 1280, height: 680 });
    });

    test('uses normal bounds for minimized windows without restoring them', () => {
        const note = createWindow({ x: -32000, y: -32000, width: 620, height: 400 }, {
            minimized: true,
            hidden: true,
            normalBounds: { x: 100, y: 100, width: 620, height: 400 },
        });
        windows.push(note);
        emitDisplayChange();
        expect(note.setBounds).not.toHaveBeenCalled();
    });

    test('repositions a minimized off-screen note without bringing it to the foreground', () => {
        const note = createWindow({ x: -32000, y: -32000, width: 620, height: 400 }, {
            minimized: true,
            hidden: true,
            normalBounds: { x: 1920, y: 100, width: 620, height: 400 },
        });
        windows.push(note);
        emitDisplayChange();
        expect(note.setBounds).toHaveBeenCalledWith({ x: 746, y: 100, width: 620, height: 400 });
        expect(note.isMinimized()).toBe(true);
    });

    test.each(['maximized', 'fullScreen'])('preserves %s state when moving an off-screen window', (state) => {
        const note = createWindow({ x: 1920, y: 0, width: 620, height: 400 }, { [state]: true });
        windows.push(note);
        emitDisplayChange();
        expect(note.setBounds).toHaveBeenCalledTimes(1);
        if (state === 'maximized') {
            expect(note.unmaximize).toHaveBeenCalledTimes(1);
            expect(note.maximize).toHaveBeenCalledTimes(1);
        } else {
            expect(note.setFullScreen.mock.calls).toEqual([[false], [true]]);
        }
    });

    test('ignores destroyed and hidden utility windows', () => {
        const bounds = { x: 1920, y: 0, width: 620, height: 400 };
        const hidden = createWindow(bounds, { hidden: true });
        const destroyed = createWindow(bounds, { destroyed: true });
        windows.push(hidden, destroyed);
        emitDisplayChange();
        expect(hidden.setBounds).not.toHaveBeenCalled();
        expect(destroyed.setBounds).not.toHaveBeenCalled();
    });
});