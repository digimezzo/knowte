"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Logging needs to be imported in main.ts also. Otherwise it just doesn't work anywhere else.
// See post by megahertz: https://github.com/megahertz/electron-log/issues/60
// "You need to import electron-log in the main process. Without it, electron-log doesn't works in a renderer process."
const electron_log_1 = require("electron-log");
const Store = require("electron-store");
const windowStateKeeper = require("electron-window-state");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const url = require("url");
electron_1.app.commandLine.appendSwitch('disable-color-correct-rendering');
electron_log_1.default.create('main');
electron_log_1.default.transports.file.resolvePath = () => path.join(electron_1.app.getPath('userData'), 'logs', 'Knowte.log');
let mainWindow, serve;
const args = process.argv.slice(1);
serve = args.some((val) => val === '--serve');
// Workaround: Global does not allow setting custom properties.
// We need to cast it to "any" first.
const globalAny = global;
// Static folder is not detected correctly in production
if (process.env.NODE_ENV !== 'development') {
    globalAny.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}
// Workaround to send messages between Electron windows
const EventEmitter = require('events');
class GlobalEventEmitter extends EventEmitter {
}
globalAny.globalEmitter = new GlobalEventEmitter();
// By default, electron-log logs only to file starting from level 'warn'. We also want 'info'.
electron_log_1.default.transports.file.level = 'info';
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();
function createMainWindow() {
    const gotTheLock = electron_1.app.requestSingleInstanceLock();
    if (!gotTheLock) {
        electron_1.app.quit();
    }
    else {
        electron_1.app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                }
                mainWindow.focus();
            }
        });
        electron_1.Menu.setApplicationMenu(undefined);
        // Load the previous state with fallback to defaults
        const mainWindowState = windowStateKeeper({
            defaultWidth: 850,
            defaultHeight: 600,
        });
        // Create the window using the state information
        mainWindow = new electron_1.BrowserWindow({
            x: mainWindowState.x,
            y: mainWindowState.y,
            width: mainWindowState.width,
            height: mainWindowState.height,
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
        }
        else {
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'dist/index.html'),
                protocol: 'file:',
                slashes: true,
            }));
        }
        // mainWindow.webContents.openDevTools();
        // Emitted when the window is closed.
        mainWindow.on('closed', () => {
            // Dereference the window object, usually you would store window
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = undefined;
            // When the main window is closed, quit the app (This also closes all other windows)
            electron_1.app.quit();
        });
        // 'ready-to-show' doesn't fire on Windows in dev mode. In prod it seems to work.
        // See: https://github.com/electron/electron/issues/7779
        mainWindow.on('ready-to-show', () => {
            mainWindow.show();
            mainWindow.focus();
        });
        // Makes links open in external browser
        const handleRedirect = (e, localUrl) => {
            // Check that the requested url is not the current page
            if (localUrl !== mainWindow.webContents.getURL()) {
                e.preventDefault();
                require('electron').shell.openExternal(localUrl);
            }
        };
        mainWindow.webContents.on('will-navigate', handleRedirect);
        mainWindow.webContents.on('new-window', handleRedirect);
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
function windowhasFrame() {
    const settings = new Store();
    if (!settings.has('useCustomTitleBar')) {
        if (os.platform() === 'win32') {
            settings.set('useCustomTitleBar', true);
        }
        else {
            settings.set('useCustomTitleBar', false);
        }
    }
    return !settings.get('useCustomTitleBar');
}
function createNoteWindow(notePath, noteId, windowHasFrame) {
    const settings = new Store();
    // Load the previous state with fallback to defaults
    const noteWindowState = windowStateKeeper({
        defaultWidth: 620,
        defaultHeight: 400,
        path: notePath,
        file: `${noteId}.state`,
    });
    // Create the window using the state information
    const noteWindow = new electron_1.BrowserWindow({
        x: noteWindowState.x,
        y: noteWindowState.y,
        width: noteWindowState.width,
        height: noteWindowState.height,
        backgroundColor: '#fff',
        frame: windowHasFrame,
        icon: path.join(globalAny.__static, os.platform() === 'win32' ? 'icons/icon.ico' : 'icons/64x64.png'),
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false,
            spellcheck: settings.get('enableSpellChecker'),
        },
        show: true,
    });
    remoteMain.enable(noteWindow.webContents);
    globalAny.windowHasFrame = windowHasFrame;
    // noteWindow.webContents.openDevTools();
    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    noteWindowState.manage(noteWindow);
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/node_modules/electron`),
        });
        noteWindow.loadURL(`http://localhost:4200#/note?id=${noteId}`);
    }
    else {
        noteWindow.loadURL(`file://${__dirname}/dist/index.html#/note?id=${noteId}`);
    }
    noteWindow.on('page-title-updated', (e) => {
        // Prevents overwriting the window title by the title which is set in index.html
        e.preventDefault();
    });
    noteWindow.on('ready-to-show', () => {
        noteWindow.show();
        noteWindow.focus();
    });
    // Makes links open in external browser
    const handleRedirect = (e, localUrl) => {
        // Check that the requested url is not the current page
        if (localUrl !== noteWindow.webContents.getURL()) {
            e.preventDefault();
            require('electron').shell.openExternal(localUrl);
        }
    };
    noteWindow.webContents.on('will-navigate', handleRedirect);
    noteWindow.webContents.on('new-window', handleRedirect);
    noteWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key.toLowerCase() === 'f12') {
            if (serve) {
                noteWindow.webContents.toggleDevTools();
            }
            event.preventDefault();
        }
    });
}
try {
    electron_log_1.default.info('[App] [main] +++ Starting +++');
    // Open note windows
    electron_1.ipcMain.on('open-note-window', (event, arg) => {
        createNoteWindow(arg.notePath, arg.noteId, arg.windowHasFrame);
    });
    // Print
    electron_1.ipcMain.on('print', (event, data) => {
        // fs.writeFileSync('/home/raphael/.config/Knowte/print.html', content);
        const win = new electron_1.BrowserWindow({
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
    electron_1.ipcMain.on('printToPDF', (event, data) => {
        const win = new electron_1.BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
                spellcheck: false,
            },
        });
        win.loadURL(`file://${data.printHtmlFilePath}`);
        win.webContents.on('did-finish-load', () => __awaiter(void 0, void 0, void 0, function* () {
            const pdfData = yield win.webContents.printToPDF({});
            try {
                yield fs.writeFile(data.pdfFilePath, pdfData);
                console.log('PDF generated successfully.');
                electron_1.shell.showItemInFolder(data.pdfFilePath);
            }
            catch (error) {
                console.log(`PDF generation failed. Error: ${error.message}`);
            }
        }));
    });
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron_1.app.on('ready', createMainWindow);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', () => {
        electron_log_1.default.info('[App] [window-all-closed] +++ Stopping +++');
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        // if (process.platform !== 'darwin') {
        //   app.quit();
        // }
        electron_1.app.quit();
    });
    electron_1.app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            createMainWindow();
        }
    });
}
catch (error) {
    // Catch Error
    // throw error;
}
//# sourceMappingURL=main.js.map