const { parentPort, workerData } = require('worker_threads');
const { backupCollections, restoreCollection } = require('./backup-engine');

let sequence = 0;
const pending = new Map();
parentPort.on('message', ({ id, error, token }) => {
    const request = pending.get(id);
    if (request) {
        pending.delete(id);
        clearTimeout(request.timeout);
        error ? request.reject(new Error(error)) : request.resolve(token);
    }
});

function checkpoint(collection) {
    return new Promise((resolve, reject) => {
        const id = ++sequence;
        const timeout = setTimeout(() => {
            pending.delete(id);
            reject(new Error('Timed out waiting for notes to finish saving.'));
        }, 30000);
        pending.set(id, { resolve, reject, timeout });
        parentPort.postMessage({ checkpoint: true, id, collection });
    });
}

(async () => {
    try {
        const warn = (warning) => parentPort.postMessage({ warning });
        const result = workerData.action === 'backup'
            ? await backupCollections(workerData.options, checkpoint, warn)
            : await restoreCollection(workerData.options, warn);
        parentPort.postMessage({ result });
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    } finally {
        parentPort.close();
    }
})();
