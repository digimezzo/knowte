import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as Datastore from 'nedb';

// Logging needs to be imported in main.ts also. Otherwise it just doesn't work anywhere else.
// See post by megahertz: https://github.com/megahertz/electron-log/issues/60
// "You need to import electron-log in the main process. Without it, electron-log doesn't works in a renderer process."
import log from 'electron-log';


let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// Because of TypeScript, we need to cast "global" to type "any".
// Otherwise it is not possible to add custom properties to "global".
// We get the error: Property '...' does not exist on type 'Global'.
const globalAny:any = global;

// nedb can only work with database files when they are created and accessed from the main process.
// If we try these calls from the renderer process, nedb uses IndexedDB Instead. 
// Figuring this out, has been a tremendous waste of time. A developer shouldn't have to waste time on such crap.
let collectionsDb: Datastore = new Datastore({ filename: path.join(app.getPath("userData"), "Collections.db"), autoload: true });
let notebooksDb: Datastore = new Datastore({ filename: path.join(app.getPath("userData"), "Notebooks.db"), autoload: true });
let notesDb: Datastore = new Datastore({ filename: path.join(app.getPath("userData"), "Notes.db"), autoload: true });

globalAny.collectionsDb = collectionsDb;
globalAny.notebooksDb = notebooksDb;
globalAny.notesDb = notesDb;

// By default, electron-log logs only to file starting from level 'warn'. We also want 'info'.
log.transports.file.level = 'info';

function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
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
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  //win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  // 'ready-to-show' doesn't fire on Windows in dev mode. In prod it seems to work. 
  // See: https://github.com/electron/electron/issues/7779
  win.on('ready-to-show', function () {
    win.show();
    win.focus();
  });

  // Makes links open in external browser
  win.webContents.on('will-navigate', function (e, url) {
    // Check that the requested url is not the current page
    if (url != win.webContents.getURL()) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    }
  });
}

try {
  log.info(`+++ Starting +++`);

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
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
