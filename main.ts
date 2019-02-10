import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

// Logging needs to be imported in main.ts also. Otherwise it just doesn't work anywhere else.
// See post by megahertz: https://github.com/megahertz/electron-log/issues/60
// "You need to import electron-log in the main process. Without it, electron-log doesn't works in a renderer process."
import log from 'electron-log';
import { DataStore } from './src/app/data/dataStore';

let mainWindow, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// Global dataStore so all windows use the same dataStore
const globalAny: any = global;
let dataStore: DataStore = new DataStore();
globalAny.dataStore = dataStore;

// Workaround to send messages between Electron windows
const EventEmitter = require('events');
class NoteEmitter extends EventEmitter {};
globalAny.noteEvents = new NoteEmitter();

// By default, electron-log logs only to file starting from level 'warn'. We also want 'info'.
log.transports.file.level = 'info';

function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  log.info(app.getLocale());

  // Create the browser window.
  mainWindow = new BrowserWindow({
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
      electron: require(`${__dirname}/node_modules/electron`)
    });
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  //win.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;

    log.info(`+++ Stopping +++`);

    // When the main window is closed, quit the app (This also closes all other windows)
    app.quit();
  });

  // 'ready-to-show' doesn't fire on Windows in dev mode. In prod it seems to work. 
  // See: https://github.com/electron/electron/issues/7779
  mainWindow.on('ready-to-show', function () {
    mainWindow.show();
    mainWindow.focus();
  });

  // Makes links open in external browser
  var handleRedirect = (e, url) => {
    // Check that the requested url is not the current page
    if (url != mainWindow.webContents.getURL()) {
      e.preventDefault()
      require('electron').shell.openExternal(url)
    }
  }

  mainWindow.webContents.on('will-navigate', handleRedirect)
  mainWindow.webContents.on('new-window', handleRedirect)
}

function createNoteWindow(noteId: string) {
  let noteWindow: BrowserWindow = new BrowserWindow({
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
      electron: require(`${__dirname}/node_modules/electron`)
    });
    noteWindow.loadURL(`http://localhost:4200#/note?id=${noteId}`);
  } else {
    noteWindow.loadURL(`file://${__dirname}/dist/index.html#/note?id=${noteId}`);
  }

  noteWindow.on('ready-to-show', function () {
    noteWindow.show();
    noteWindow.focus();
  });

  // Makes links open in external browser
  var handleRedirect = (e, url) => {
    // Check that the requested url is not the current page
    if (url != noteWindow.webContents.getURL()) {
      e.preventDefault()
      require('electron').shell.openExternal(url)
    }
  }

  noteWindow.webContents.on('will-navigate', handleRedirect);
  noteWindow.webContents.on('new-window', handleRedirect);
}

try {
  log.info(`+++ Starting +++`);

  // OPen note windows
  ipcMain.on('open-note-window', (event, arg) => {
    createNoteWindow(arg);
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    log.info(`+++ Stopping +++`);
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
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
