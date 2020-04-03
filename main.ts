import { app, BrowserWindow, screen, ipcMain, shell, SaveDialogOptions, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as windowStateKeeper from 'electron-window-state';
import * as fs from 'fs-extra';
import * as Store from 'electron-store';

// Logging needs to be imported in main.ts also. Otherwise it just doesn't work anywhere else.
// See post by megahertz: https://github.com/megahertz/electron-log/issues/60
// "You need to import electron-log in the main process. Without it, electron-log doesn't works in a renderer process."
import log from 'electron-log';

let mainWindow, workerWindow, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// Workaround: Global does not allow setting custom properties.
// We need to cast it to "any" first.
const globalAny: any = global;

// Workaround to send messages between Electron windows
const EventEmitter = require('events');
class GlobalEventEmitter extends EventEmitter { }
globalAny.globalEmitter = new GlobalEventEmitter();

// By default, electron-log logs only to file starting from level 'warn'. We also want 'info'.
log.transports.file.level = 'info';

function createMainWindow(): void {
  const gotTheLock: boolean = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }

        mainWindow.focus();
      }
    });

    Menu.setApplicationMenu(null);

    // Load the previous state with fallback to defaults
    const mainWindowState = windowStateKeeper({
      defaultWidth: 850,
      defaultHeight: 600
    });

    // Create the window using the state information
    mainWindow = new BrowserWindow({
      'x': mainWindowState.x,
      'y': mainWindowState.y,
      'width': mainWindowState.width,
      'height': mainWindowState.height,
      backgroundColor: '#fff',
      frame: getUseNativeTitleBar(),
      icon: path.join(__dirname, 'build/icon/icon.png'),
      show: false
    });

    // HACK
    (mainWindow as any).hasFrame = getUseNativeTitleBar();

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(mainWindow);

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

    workerWindow = new BrowserWindow({ show: false });
    workerWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/worker.html'),
      protocol: 'file:',
      slashes: true
    }));

    workerWindow.on('closed', () => {
      workerWindow = undefined;
    });

    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store window
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;

      // When the main window is closed, quit the app (This also closes all other windows)
      app.quit();
    });

    // 'ready-to-show' doesn't fire on Windows in dev mode. In prod it seems to work.
    // See: https://github.com/electron/electron/issues/7779
    mainWindow.on('ready-to-show', () => {
      mainWindow.show();
      mainWindow.focus();
    });

    // Makes links open in external browser
    const handleRedirect = (e: any, localUrl: string) => {
      // Check that the requested url is not the current page
      if (localUrl !== mainWindow.webContents.getURL()) {
        e.preventDefault();
        require('electron').shell.openExternal(localUrl);
      }
    };

    mainWindow.webContents.on('will-navigate', handleRedirect);
    mainWindow.webContents.on('new-window', handleRedirect);
  }
}

function getUseNativeTitleBar(): boolean {
  const settings: Store<any> = new Store();

  if (!settings.has('useNativeTitleBar')) {
    settings.set('useNativeTitleBar', false);
  }

  return settings.get('useNativeTitleBar');
}

function createNoteWindow(notePath: string, noteId: string): void {
  // Load the previous state with fallback to defaults
  const noteWindowState = windowStateKeeper({
    defaultWidth: 620,
    defaultHeight: 400,
    path: notePath,
    file: `${noteId}.state`
  });

  // Create the window using the state information
  const noteWindow: BrowserWindow = new BrowserWindow({
    'x': noteWindowState.x,
    'y': noteWindowState.y,
    'width': noteWindowState.width,
    'height': noteWindowState.height,
    backgroundColor: '#fff',
    frame: getUseNativeTitleBar(),
    show: true,
  });

  // HACK
  (noteWindow as any).hasFrame = getUseNativeTitleBar();

  // noteWindow.webContents.openDevTools();

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  noteWindowState.manage(noteWindow);

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    noteWindow.loadURL(`http://localhost:4200#/note?id=${noteId}`);
  } else {
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
  const handleRedirect = (e: any, localUrl: string) => {
    // Check that the requested url is not the current page
    if (localUrl !== noteWindow.webContents.getURL()) {
      e.preventDefault();
      require('electron').shell.openExternal(localUrl);
    }
  };

  noteWindow.webContents.on('will-navigate', handleRedirect);
  noteWindow.webContents.on('new-window', handleRedirect);
}

try {
  log.info('[App] [main] +++ Starting +++');

  // Open note windows
  ipcMain.on('open-note-window', (event: any, arg: any) => {
    createNoteWindow(arg.notePath, arg.noteId);
  });

  // Print
  ipcMain.on('print', (event: any, content: any) => {
    workerWindow.webContents.send('print', content);
  });

  ipcMain.on('readyToPrint', (event: any) => {
    workerWindow.webContents.print({ silent: false, printBackground: true });
  });

  // PrintPDF
  ipcMain.on('printPDF', (event: any, content: any) => {
    workerWindow.webContents.send('printPDF', content);
  });

  ipcMain.on('readyToPrintPDF', (event: any, safePath: string) => {
    workerWindow.webContents.printToPDF({}, (error: any, data: any) => {
      if (error) {
        throw error;
      }

      fs.writeFile(safePath, data, (localError: any) => {
        if (localError) {
          throw localError;
        }

        shell.openItem(safePath);
      });
    });
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createMainWindow);

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

} catch (e) {
  // Catch Error
  // throw e;
}
