"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
// Logging needs to be imported in main.ts also. Otherwise it just doesn't work anywhere else.
// See post by megahertz: https://github.com/megahertz/electron-log/issues/60
// "You need to import electron-log in the main process. Without it, electron-log doesn't works in a renderer process."
var electron_log_1 = require("electron-log");
var dataStore_1 = require("./src/app/data/dataStore");
var note_service_1 = require("./src/app/services/note.service");
var mainWindow, serve;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
// Global dataStore so all windows use the same dataStore
var globalAny = global;
var dataStore = new dataStore_1.DataStore();
globalAny.dataStore = dataStore;
var noteService = new note_service_1.NoteService();
globalAny.noteService = noteService;
// By default, electron-log logs only to file starting from level 'warn'. We also want 'info'.
electron_log_1.default.transports.file.level = 'info';
function createWindow() {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    electron_log_1.default.info(electron_1.app.getLocale());
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        x: 50,
        y: 50,
        width: 850,
        height: 600,
        backgroundColor: '#fff',
        frame: false,
        icon: path.join(__dirname, 'build/icon/icon.png'),
        show: false
    });
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        mainWindow.loadURL('http://localhost:4200');
    }
    else {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    //win.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        electron_log_1.default.info("+++ Stopping +++");
        // When the main window is closed, quit the app (This also closes all other windows)
        electron_1.app.quit();
    });
    // 'ready-to-show' doesn't fire on Windows in dev mode. In prod it seems to work. 
    // See: https://github.com/electron/electron/issues/7779
    mainWindow.on('ready-to-show', function () {
        mainWindow.show();
        mainWindow.focus();
    });
    // Makes links open in external browser
    mainWindow.webContents.on('will-navigate', function (e, url) {
        // Check that the requested url is not the current page
        if (url != mainWindow.webContents.getURL()) {
            e.preventDefault();
            require('electron').shell.openExternal(url);
        }
    });
}
function createNoteWindow(noteId) {
    var noteWindow = new electron_1.BrowserWindow({
        x: 50,
        y: 50,
        width: 450,
        height: 400,
        backgroundColor: '#fff',
        frame: false,
        show: false
    });
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        noteWindow.loadURL("http://localhost:4200#/note?id=" + noteId);
    }
    else {
        noteWindow.loadURL("file://" + __dirname + "/dist/index.html#/note?id=" + noteId);
    }
    noteWindow.on('ready-to-show', function () {
        electron_log_1.default.info("Opening note with id=" + noteId);
        dataStore.setNoteIsOpen(noteId, true);
        noteWindow.show();
        noteWindow.focus();
    });
    noteWindow.on('close', function () {
        electron_log_1.default.info("Closing note with id=" + noteId);
        dataStore.setNoteIsOpen(noteId, false);
    });
}
try {
    electron_log_1.default.info("+++ Starting +++");
    // OPen note windows
    electron_1.ipcMain.on('open-note-window', function (event, arg) {
        createNoteWindow(arg);
    });
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron_1.app.on('ready', createWindow);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        electron_log_1.default.info("+++ Stopping +++");
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        // if (process.platform !== 'darwin') {
        //   app.quit();
        // }
        electron_1.app.quit();
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
//# sourceMappingURL=main.js.map