import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

// Logging needs to be imported in main.ts also. Otherwise it just doesn't work anywhere else.
// See post by megahertz: https://github.com/megahertz/electron-log/issues/60
// "You need to import electron-log in the main process. Without it, electron-log doesn't works in a renderer process."
import log from 'electron-log';


let mainWindow, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// By default, electron-log logs only to file starting from level 'warn'. We also want 'info'.
log.transports.file.level = 'info';

function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

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

function createNoteWindow() {
  let noteWindow: BrowserWindow = new BrowserWindow({
    x: 50,
    y: 50,
    width: 400,
    height: 500,
    backgroundColor: '#fff',
    frame: true,
    show: true
  });

  if (serve) {
    noteWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'src/note.html'),
      protocol: 'file:',
      slashes: true
    }));
  } else {
    noteWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/note.html'),
      protocol: 'file:',
      slashes: true
    }));
  }
}

try {
  log.info(`+++ Starting +++`);

  // OPen note windows
  ipcMain.on('open-note-window', (event, arg) => {
    createNoteWindow();
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
    if (process.platform !== 'darwin') {
      app.quit();
    }
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
