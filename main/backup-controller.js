const path = require('path');
const { Worker } = require('worker_threads');

function registerBackups({ app, ipcMain, getMainWindow, log }) {
    let active;
    let sequence = 0;
    const checkpoints = new Map();
    ipcMain.on('backup-checkpoint-result', (event, response) => {
        const window = getMainWindow();
        if (window && event.sender === window.webContents && checkpoints.has(response.id)) {
            checkpoints.get(response.id)(response);
        }
    });
    ipcMain.handle('backup-run', async (event, request) => {
        const window = getMainWindow();
        if (!window || event.sender !== window.webContents) {
            throw new Error('Backups can only be managed by the main window.');
        }
        if (active) {
            throw new Error('A backup or restore is already running.');
        }
        if (!request || !['backup', 'restore'].includes(request.action)) {
            throw new Error('Invalid backup operation.');
        }
        const options = {
            ...request.options,
            workspace: path.join(app.getPath('userData'), 'Backups'),
        };
        const worker = new Worker(path.join(__dirname, 'backup-worker.js'), {
            workerData: { action: request.action, options },
        });
        active = worker;
        const startTime = Date.now();
        log.info(`[Backup] ${request.action} started.`);
        try {
            return await new Promise((resolve, reject) => {
                let finished = false;
                worker.on('message', (message) => {
                    if (message.warning) {
                        log.warn(`[Backup] ${message.warning}`);
                    } else if (message.checkpoint) {
                        const requestId = ++sequence;
                        checkpoints.set(requestId, (response) => {
                            checkpoints.delete(requestId);
                            worker.postMessage({ id: message.id, error: response.error, code: response.code, token: response.token });
                        });
                        window.webContents.send('backup-checkpoint', {
                            id: requestId, collection: message.collection, storage: options.storage,
                        });
                    } else {
                        finished = true;
                        if (message.postponed) {
                            log.warn(`[Backup] Backup postponed: ${message.reason}`);
                            resolve({ postponed: true });
                        } else {
                            message.error ? reject(new Error(message.error)) : resolve(message.result);
                        }
                    }
                });
                worker.once('error', reject);
                worker.once('exit', (code) => {
                    if (!finished) {
                        reject(new Error(`Backup worker exited unexpectedly (${code}).`));
                    }
                });
            });
        } catch (error) {
            log.error(`[Backup] ${error.message}`);
            throw error;
        } finally {
            log.info(`[Backup] ${request.action} finished in ${Date.now() - startTime} ms.`);
            checkpoints.clear();
            active = undefined;
        }
    });
    app.on('before-quit', () => {
        if (active) {
            active.terminate();
        }
    });
}

module.exports = { registerBackups };
