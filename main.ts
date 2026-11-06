import { app, BrowserWindow, ipcMain, Menu, screen, shell } from 'electron';
// Logging needs to be imported in main.ts also. Otherwise it just doesn't work anywhere else.
// See post by megahertz: https://github.com/megahertz/electron-log/issues/60
// "You need to import electron-log in the main process. Without it, electron-log doesn't works in a renderer process."
import log from 'electron-log';
import * as windowStateKeeper from 'electron-window-state';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as url from 'url';
import { SettingsStore } from './src/app/common/settings/settings-store';

app.commandLine.appendSwitch('disable-color-correct-rendering');

log.create('main');
log.transports.file.resolvePath = () => path.join(app.getPath('userData'), 'logs', 'Knowte.log');

let mainWindow, serve;
const args = process.argv.slice(1);
serve = args.some((val) => val === '--serve');

// Workaround: Global does not allow setting custom properties.
// We need to cast it to "any" first.
const globalAny: any = global;

// Static folder is not detected correctly in production
if (process.env.NODE_ENV !== 'development') {
    globalAny.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

// Workaround to send messages between Electron windows
const EventEmitter = require('events');
class GlobalEventEmitter extends EventEmitter {}
globalAny.globalEmitter = new GlobalEventEmitter();

// By default, electron-log logs only to file starting from level 'warn'. We also want 'info'.
log.transports.file.level = 'info';

const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

require('./main/backup-controller').registerBackups({
    app,
    ipcMain,
    getMainWindow: () => mainWindow,
    log,
});

function createMainWindow(): void {
    const gotTheLock: boolean = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
    } else {
        if (process.platform === 'linux') {
            require('./main/linux-accent-monitor').startLinuxAccentMonitor({ app, BrowserWindow, log });
        }

        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                }

                mainWindow.focus();
            }
        });

        Menu.setApplicationMenu(undefined);

        // Load the previous state with fallback to defaults
        const mainWindowState = windowStateKeeper({
            defaultWidth: 850,
            defaultHeight: 600,
        });

        // Create the window using the state information
        mainWindow = new BrowserWindow({
            x: mainWindowState.x,
            y: mainWindowState.y,
            width: mainWindowState.width,
            height: mainWindowState.height,
            minWidth: 800,
            minHeight: 500,
            backgroundColor: '#fff',
            frame: windowhasFrame(),
            icon: path.join(globalAny.__static, os.platform() === 'win32' ? 'icons/icon.ico' : 'icons/64x64.png'),
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true,
                contextIsolation: false,
                spellcheck: false,
            },
            show: false,
        });

        remoteMain.enable(mainWindow.webContents);

        globalAny.windowHasFrame = windowhasFrame();

        // Let us register listeners on the window, so we can update the state
        // automatically (the listeners will be removed when the window is closed)
        // and restore the maximized or full screen state
        mainWindowState.manage(mainWindow);

        if (serve) {
            require('electron-reload')(__dirname, {
                electron: require(`${__dirname}/node_modules/electron`),
            });
            mainWindow.loadURL('http://localhost:4200');
        } else {
            mainWindow.loadURL(
                url.format({
                    pathname: path.join(__dirname, 'dist/index.html'),
                    protocol: 'file:',
                    slashes: true,
                }),
            );
        }

        // mainWindow.webContents.openDevTools();

        // Emitted when the window is closed.
        mainWindow.on('closed', () => {
            // Dereference the window object, usually you would store window
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = undefined;

            // When the main window is closed, quit the app (This also closes all other windows)
            app.quit();
        });

        // 'ready-to-show' doesn't fire on Windows in dev mode. In prod it seems to work.
        // See: https://github.com/electron/electron/issues/7779
        mainWindow.on('ready-to-show', () => {
            mainWindow.show();
            mainWindow.focus();
            scheduleSpareNoteWindow(0);
        });

        // Makes links open in external browser
        const handleRedirect = (e: any, localUrl: string) => {
            // Check that the requested url is not the current page
            if (localUrl !== mainWindow.webContents.getURL()) {
                e.preventDefault();
                openExternalLink(localUrl);
            }
        };

        mainWindow.webContents.on('will-navigate', handleRedirect);
        mainWindow.webContents.setWindowOpenHandler(({ url: openUrl }) => {
            openExternalLink(openUrl);
            return { action: 'deny' };
        });

        mainWindow.webContents.on('before-input-event', (event, input) => {
            if (input.key.toLowerCase() === 'f12') {
                if (serve) {
                    mainWindow.webContents.toggleDevTools();
                }

                event.preventDefault();
            }
        });
    }
}

function recoverOffScreenWindows(): void {
    const displays = screen.getAllDisplays();

    if (displays.length === 0) {
        return;
    }

    for (const window of BrowserWindow.getAllWindows()) {
        if (window.isDestroyed() || (!window.isVisible() && !window.isMinimized())) {
            continue;
        }

        const isMaximized = window.isMaximized();
        const isFullScreen = window.isFullScreen();
        const bounds = window.isMinimized() || isMaximized || isFullScreen ? window.getNormalBounds() : window.getBounds();
        const isOnScreen = displays.some(({ workArea }) =>
            bounds.x < workArea.x + workArea.width &&
            bounds.x + bounds.width > workArea.x &&
            bounds.y < workArea.y + workArea.height &&
            bounds.y + bounds.height > workArea.y,
        );

        if (isOnScreen) {
            continue;
        }

        const workArea = screen.getDisplayMatching(bounds).workArea;
        const width = Math.min(bounds.width, workArea.width);
        const height = Math.min(bounds.height, workArea.height);

        if (isFullScreen) {
            window.setFullScreen(false);
        }

        if (isMaximized) {
            window.unmaximize();
        }

        window.setBounds({
            x: Math.max(workArea.x, Math.min(bounds.x, workArea.x + workArea.width - width)),
            y: Math.max(workArea.y, Math.min(bounds.y, workArea.y + workArea.height - height)),
            width,
            height,
        });

        if (isMaximized) {
            window.maximize();
        }

        if (isFullScreen) {
            window.setFullScreen(true);
        }
    }
}

function openExternalLink(url: string): void {
    if (/^knowte:/i.test(url)) {
        log.warn('[App] Blocked internal note URL from opening outside Knowte.');
        return;
    }
    shell.openExternal(url);
}

function windowhasFrame(): boolean {
    const settings = new SettingsStore(app.getPath('userData'));

    if (!settings.has('useCustomTitleBar')) {
        if (os.platform() === 'win32') {
            settings.set('useCustomTitleBar', true);
        } else {
            settings.set('useCustomTitleBar', false);
        }
    }

    return !settings.get('useCustomTitleBar');
}

interface SpareNoteWindow {
    window: BrowserWindow;
    windowHasFrame: boolean;
    settingsSnapshot: string | undefined;
    loaded: Promise<boolean>;
    isLoading: () => boolean;
}

let spareNoteWindow: SpareNoteWindow | undefined;
let spareNoteWindowTimer: ReturnType<typeof setTimeout> | undefined;
let settingsWatcherTimer: ReturnType<typeof setTimeout> | undefined;
let isWatchingSettings: boolean = false;
let noteOpenDiagnosticsEnabled: boolean = false;
let nextSpareDiagnosticId: number = 0;

function noteOpenTrace(label: string): (stage: string) => void {
    if (!noteOpenDiagnosticsEnabled) {
        return () => {};
    }
    const start = performance.now();
    return (stage: string) => {
        log.info(`[Performance] [noteOpen] ${label} ${stage} elapsed=${(performance.now() - start).toFixed(1)} ms (pid=${process.pid})`);
    };
}

function readNoteWindowSettingsSnapshot(): string | undefined {
    try {
        const settingsFile: string = path.join(app.getPath('userData'), 'config.json');
        if (!fs.existsSync(settingsFile)) {
            return '';
        }
        // Backup status changes frequently and does not affect note windows.
        const { backupLastSuccess, backupLastError, ...relevantSettings } = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
        return JSON.stringify(relevantSettings);
    } catch (error) {
        return undefined;
    }
}

function noteWindowUrl(noteId?: string): string {
    const hash: string = noteId == undefined ? '#/note' : `#/note?id=${encodeURIComponent(noteId)}`;
    return serve ? `http://localhost:4200${hash}` : `file://${__dirname}/dist/index.html${hash}`;
}

function getStaleSpareReason(spare: SpareNoteWindow, windowHasFrame: boolean): string | undefined {
    if (spare.window.isDestroyed() || spare.window.webContents.isCrashed()) {
        return 'renderer is gone';
    }
    if (spare.windowHasFrame !== windowHasFrame) {
        return 'title bar setting changed';
    }
    const settingsSnapshot: string | undefined = readNoteWindowSettingsSnapshot();
    // The spare window cached the settings at load time, so it can only be used if they did not change since.
    if (settingsSnapshot == undefined || settingsSnapshot !== spare.settingsSnapshot) {
        return 'settings changed';
    }
    return undefined;
}

function discardSpareNoteWindow(spare: SpareNoteWindow): void {
    if (spareNoteWindow === spare) {
        spareNoteWindow = undefined;
    }
    if (spare.window.isDestroyed()) {
        return;
    }
    if (spare.window.webContents.isCrashed()) {
        spare.window.destroy();
    } else {
        // close() instead of destroy() so the renderer's unload handlers unregister its globalEmitter listeners.
        spare.window.close();
    }
}

// Replaces a stale spare as soon as settings change, so it is fresh again by the time a note is opened.
function watchSettingsForSpareNoteWindow(): void {
    if (isWatchingSettings) {
        return;
    }
    isWatchingSettings = true;

    try {
        // Watch the directory: settings are saved by renaming a temporary file over config.json.
        fs.watch(app.getPath('userData'), (eventType: string, fileName: string) => {
            if (fileName !== 'config.json') {
                return;
            }
            clearTimeout(settingsWatcherTimer);
            settingsWatcherTimer = setTimeout(() => {
                const spare: SpareNoteWindow | undefined = spareNoteWindow;
                if (spare != undefined && getStaleSpareReason(spare, windowhasFrame()) != undefined) {
                    log.info('[App] Settings changed. Replacing spare note window.');
                    discardSpareNoteWindow(spare);
                    scheduleSpareNoteWindow(500);
                }
            }, 300);
        });
    } catch (error) {
        log.warn(`[App] Could not watch settings for spare note window: ${error.message}`);
    }
}

function scheduleSpareNoteWindow(delayMilliseconds: number): void {
    if (spareNoteWindow != undefined || spareNoteWindowTimer != undefined) {
        return;
    }

    const trace = noteOpenTrace(`spareId=${noteOpenDiagnosticsEnabled ? ++nextSpareDiagnosticId : 0}`);
    trace(`scheduled delay=${delayMilliseconds} ms`);
    spareNoteWindowTimer = setTimeout(() => {
        spareNoteWindowTimer = undefined;
        if (mainWindow == undefined || spareNoteWindow != undefined) {
            trace('creation skipped');
            return;
        }

        trace('creation started');
        watchSettingsForSpareNoteWindow();

        const settingsSnapshot: string | undefined = readNoteWindowSettingsSnapshot();
        const windowHasFrame: boolean = windowhasFrame();
        trace('settings read');
        const window: BrowserWindow = buildNoteWindow(windowHasFrame, false, {});
        trace(`window created webContentsId=${window.webContents.id}`);
        const loadStartTime: number = Date.now();
        trace('load starting');
        if (noteOpenDiagnosticsEnabled) {
            window.webContents.once('did-start-loading', () => trace('did-start-loading'));
            window.webContents.once('dom-ready', () => trace('dom-ready'));
            window.webContents.once('did-stop-loading', () => trace('did-stop-loading'));
        }
        let loadFinished = false;
        const loaded: Promise<boolean> = new Promise((resolve) => {
            window.webContents.once('did-finish-load', () => {
                loadFinished = true;
                trace('did-finish-load');
                log.info(`[App] Spare note window loaded in ${Date.now() - loadStartTime} ms.`);
                resolve(true);
            });
            window.webContents.once('did-fail-load', () => {
                loadFinished = true;
                trace('did-fail-load');
                resolve(false);
            });
            window.once('closed', () => {
                loadFinished = true;
                trace('closed');
                resolve(false);
            });
        });
        const spare: SpareNoteWindow = { window, windowHasFrame, settingsSnapshot, loaded, isLoading: () => !loadFinished };
        spareNoteWindow = spare;

        window.on('closed', () => {
            if (spareNoteWindow === spare) {
                spareNoteWindow = undefined;
            }
        });
        window.loadURL(noteWindowUrl());
    }, delayMilliseconds);
}

async function takeSpareNoteWindow(windowHasFrame: boolean, trace: (stage: string) => void): Promise<BrowserWindow | undefined> {
    const spare: SpareNoteWindow | undefined = spareNoteWindow;

    if (spare == undefined) {
        trace('spare=unavailable');
        log.info('[App] No spare note window available. Creating a new note window.');
        return undefined;
    }

    spareNoteWindow = undefined;

    // A spare that is still loading is always further along than a new window would be.
    if (noteOpenDiagnosticsEnabled) {
        trace(`spare wait started state=${spare.isLoading() ? 'loading' : 'settled'} webContentsId=${spare.window.webContents.id}`);
    }
    const waitStarted = noteOpenDiagnosticsEnabled ? performance.now() : 0;
    const isLoaded: boolean = await spare.loaded;
    if (noteOpenDiagnosticsEnabled) {
        trace(`spare wait finished loaded=${isLoaded} wait=${(performance.now() - waitStarted).toFixed(1)} ms`);
    }
    const staleReason: string | undefined = isLoaded ? getStaleSpareReason(spare, windowHasFrame) : 'failed to load';

    if (staleReason != undefined) {
        trace(`spare rejected reason=${staleReason}`);
        log.info(`[App] Spare note window not usable (${staleReason}). Creating a new note window.`);
        discardSpareNoteWindow(spare);
        return undefined;
    }

    return spare.window;
}

function buildNoteWindow(
    windowHasFrame: boolean,
    show: boolean,
    bounds: { x?: number; y?: number; width?: number; height?: number },
): BrowserWindow {
    const settings = new SettingsStore(app.getPath('userData'));

    const noteWindow: BrowserWindow = new BrowserWindow({
        ...bounds,
        minWidth: 800,
        minHeight: 500,
        backgroundColor: '#fff',
        frame: windowHasFrame,
        icon: path.join(globalAny.__static, os.platform() === 'win32' ? 'icons/icon.ico' : 'icons/64x64.png'),
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false,
            spellcheck: settings.get('enableSpellChecker'),
        },
        show,
    });

    remoteMain.enable(noteWindow.webContents);

    // noteWindow.webContents.openDevTools();

    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/node_modules/electron`),
        });
    }

    noteWindow.on('page-title-updated', (e) => {
        // Prevents overwriting the window title by the title which is set in index.html
        e.preventDefault();
    });

    // Makes links open in external browser
    const handleRedirect = (e: any, localUrl: string) => {
        // Check that the requested url is not the current page
        if (localUrl !== noteWindow.webContents.getURL()) {
            e.preventDefault();
            openExternalLink(localUrl);
        }
    };

    noteWindow.webContents.on('will-navigate', handleRedirect);
    noteWindow.webContents.setWindowOpenHandler(({ url: openUrl }) => {
        openExternalLink(openUrl);
        return { action: 'deny' };
    });

    noteWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key.toLowerCase() === 'f12') {
            if (serve) {
                noteWindow.webContents.toggleDevTools();
            }

            event.preventDefault();
        }
    });

    return noteWindow;
}

async function createNoteWindow(notePath: string, noteId: string, windowHasFrame: boolean): Promise<void> {
    const trace = noteOpenTrace(`noteId=${noteId}`);
    trace('main request received');
    // Load the previous state with fallback to defaults
    const noteWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 500,
        path: notePath,
        file: `${noteId}.state`,
    });

    trace('window state loaded');
    let noteWindow: BrowserWindow | undefined = await takeSpareNoteWindow(windowHasFrame, trace);

    if (noteWindow != undefined) {
        trace(`using spare webContentsId=${noteWindow.webContents.id}`);
        if (noteWindowState.x != undefined && noteWindowState.y != undefined) {
            noteWindow.setBounds({
                x: noteWindowState.x,
                y: noteWindowState.y,
                width: noteWindowState.width,
                height: noteWindowState.height,
            });
        } else {
            noteWindow.setSize(noteWindowState.width, noteWindowState.height);
            noteWindow.center();
        }

        // In-page hash navigation lets the already bootstrapped app show the note without reloading.
        noteWindow.webContents.executeJavaScript(`window.location.hash = ${JSON.stringify(`#/note?id=${encodeURIComponent(noteId)}`)};`);
        noteWindow.show();
        noteWindow.focus();
        trace('spare navigation requested and shown');
    } else {
        // Create the window using the state information
        const newNoteWindow: BrowserWindow = buildNoteWindow(windowHasFrame, true, {
            x: noteWindowState.x,
            y: noteWindowState.y,
            width: noteWindowState.width,
            height: noteWindowState.height,
        });
        trace(`new window created webContentsId=${newNoteWindow.webContents.id}`);
        if (noteOpenDiagnosticsEnabled) {
            newNoteWindow.webContents.once('did-start-loading', () => trace('new window did-start-loading'));
            newNoteWindow.webContents.once('dom-ready', () => trace('new window dom-ready'));
            newNoteWindow.webContents.once('did-finish-load', () => trace('new window did-finish-load'));
            newNoteWindow.webContents.once('did-fail-load', () => trace('new window did-fail-load'));
        }
        newNoteWindow.on('ready-to-show', () => {
            trace('new window ready-to-show');
            newNoteWindow.show();
            newNoteWindow.focus();
        });
        newNoteWindow.loadURL(noteWindowUrl(noteId));
        noteWindow = newNoteWindow;
    }

    globalAny.windowHasFrame = windowHasFrame;

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    noteWindowState.manage(noteWindow);
    trace('window state management registered');

    // Prepare the next note window in the background, after this one had time to render.
    scheduleSpareNoteWindow(500);
}

try {
    log.info('[App] [main] +++ Starting +++');

    // Open note windows
    ipcMain.on('open-note-window', (event: any, arg: any) => {
        createNoteWindow(arg.notePath, arg.noteId, arg.windowHasFrame).catch((error) =>
            log.error(`[App] Could not open note window: ${error.message}`),
        );
    });

    // Print
    ipcMain.on('print', (event: any, data: any) => {
        const win = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
                spellcheck: false,
            },
        });

        win.loadURL(`file://${data.printHtmlFilePath}`);

        win.webContents.on('did-finish-load', () => {
            win.webContents.print({ silent: false, printBackground: true });
        });
    });

    // PrintPDF
    ipcMain.on('printToPDF', (event: any, data: any) => {
        const win = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
                spellcheck: false,
            },
        });

        win.loadURL(`file://${data.printHtmlFilePath}`);

        win.webContents.on('did-finish-load', async () => {
            const pdfData: Buffer = await win.webContents.printToPDF({});

            try {
                await fs.writeFile(data.pdfFilePath, pdfData);

                console.log('PDF generated successfully.');
                shell.showItemInFolder(data.pdfFilePath);
            } catch (error) {
                console.log(`PDF generation failed. Error: ${error.message}`);
            }
        });
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createMainWindow);

    app.on('ready', () => {
        screen.on('display-removed', recoverOffScreenWindows);
        screen.on('display-metrics-changed', recoverOffScreenWindows);

        // Opt-in via Settings > Advanced > Diagnostics. Applies after a restart, like the renderer monitors.
        noteOpenDiagnosticsEnabled = new SettingsStore(app.getPath('userData')).get('performanceDiagnosticsEnabled', false);
        if (noteOpenDiagnosticsEnabled) {
            require('./main/event-loop-monitor').monitorMainProcessEventLoop(log);
        }
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        log.info('[App] [window-all-closed] +++ Stopping +++');
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        // if (process.platform !== 'darwin') {
        //   app.quit();
        // }
        app.quit();
    });

    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            createMainWindow();
        }
    });
} catch (error) {
    // Catch Error
    // throw error;
}
