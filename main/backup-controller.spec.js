const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { EventEmitter } = require('events');
const { registerBackups } = require('./backup-controller');

describe('Backup main-process bridge', () => {
    let root;
    let ipcMain;
    let handlers;
    let window;
    let options;
    let log;

    beforeEach(async () => {
        root = await fs.mkdtemp(path.join(os.tmpdir(), 'knowte-backup-bridge-'));
        options = { storage: path.join(root, 'collections'), destination: path.join(root, 'cloud'), retention: 2 };
        await fs.outputJson(path.join(options.storage, 'Work', 'Work.db'), {
            collections: [{ name: 'notes', data: [] }, { name: 'notebooks', data: [] }],
        });
        await fs.ensureDir(options.destination);
        handlers = new Map();
        ipcMain = new EventEmitter();
        ipcMain.handle = (name, callback) => handlers.set(name, callback);
        window = { webContents: {
            send: jest.fn((name, request) => {
                if (name === 'backup-checkpoint') {
                    ipcMain.emit('backup-checkpoint-result', { sender: window.webContents }, { id: request.id, token: 'saved' });
                }
            }),
        } };
        const app = new EventEmitter();
        app.getPath = () => root;
        log = { error: jest.fn(), warn: jest.fn() };
        registerBackups({ app, ipcMain, getMainWindow: () => window, log });
    });

    afterEach(async () => {
        await fs.remove(root);
    });

    test('round-trips checkpoints between the worker and main renderer', async () => {
        const result = await handlers.get('backup-run')({ sender: window.webContents }, { action: 'backup', options });
        expect(result[0].collection).toBe('Work');
        expect(window.webContents.send).toHaveBeenCalledTimes(2);
        expect(await fs.pathExists(path.join(options.destination, result[0].file))).toBe(true);
    });

    test('refuses overlapping jobs until the first result is returned', async () => {
        const run = handlers.get('backup-run');
        const first = run({ sender: window.webContents }, { action: 'backup', options });
        await expect(run({ sender: window.webContents }, { action: 'backup', options }))
            .rejects.toThrow('already running');
        await first;
    });

    test('logs missing-content warnings without treating them as a completed or failed worker job', async () => {
        await fs.outputJson(path.join(options.storage, 'Work', 'Work.db'), {
            collections: [
                { name: 'notes', data: [{ id: 'missing', isMarkdownNote: true }] },
                { name: 'notebooks', data: [] },
            ],
        });
        const run = handlers.get('backup-run');
        const [backup] = await run({ sender: window.webContents }, { action: 'backup', options });
        expect(await fs.pathExists(path.join(options.destination, backup.file))).toBe(true);
        expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('Missing content for note missing'));
        expect(log.error).not.toHaveBeenCalled();
        log.warn.mockClear();
        const restored = await run({ sender: window.webContents }, {
            action: 'restore',
            options: { archive: path.join(options.destination, backup.file), storage: options.storage },
        });
        expect(restored.collection).toBe('Work (restored)');
        expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('Missing content for note missing'));
        expect(log.error).not.toHaveBeenCalled();
    });

    test('rejects requests from note windows and unknown operations', async () => {
        const run = handlers.get('backup-run');
        await expect(run({ sender: {} }, { action: 'backup', options })).rejects.toThrow('main window');
        await expect(run({ sender: window.webContents }, { action: 'delete', options })).rejects.toThrow('Invalid');
    });
});
