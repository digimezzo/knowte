const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { Worker } = require('worker_threads');
const archiver = require('archiver');
const Loki = require('lokijs');
const { backupCollections, restoreCollection, extractAndVerify } = require('./backup-engine');

global.setImmediate = require('timers').setImmediate;
global.clearImmediate = require('timers').clearImmediate;

describe('Collection backups', () => {
    let root;
    let options;
    let source;

    beforeEach(async () => {
        root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'knowte-backup-test-')));
        options = {
            storage: path.join(root, 'collections'),
            destination: path.join(root, 'cloud'),
            workspace: path.join(root, 'local-staging'),
            retention: 2,
        };
        source = path.join(options.storage, 'Work');
        await fs.ensureDir(source);
        await fs.ensureDir(options.destination);
        const database = new Loki(path.join(source, 'Work.db'));
        database.addCollection('notes').insert([
                    { id: 'markdown', title: 'Markdown', notebookId: 'book', isMarkdownNote: true, tags: ['work'] },
                    { id: 'classic', title: 'Classic', notebookId: '', isMarkdownNote: false, isTrashed: true },
                    { id: 'encrypted', title: 'Secret', notebookId: '', isMarkdownNote: true, isEncrypted: true },
        ]);
        database.addCollection('notebooks').insert({ id: 'book', name: 'Notebook', isArchived: true });
        await fs.writeFile(path.join(source, 'Work.db'), database.serialize());
        await fs.writeFile(path.join(source, 'markdown.md'), '[Classic](knowte://note/classic)\n![Image](image.png)');
        await fs.writeFile(path.join(source, 'classic.content'), '{"ops":[{"insert":"Classic note"}]}');
        await fs.writeFile(path.join(source, 'encrypted.md'), 'encrypted-content');
        await fs.outputFile(path.join(source, 'markdown/image.png'), Buffer.from([0, 1, 2, 255]));
        await fs.outputFile(path.join(source, 'encrypted/secret.png.enc'), 'encrypted-attachment');
    });

    afterEach(async () => {
        await fs.remove(root);
    });

    async function createBackup(extra = {}, checkpoint) {
        const [result] = await backupCollections({ ...options, ...extra }, checkpoint);
        return path.join(options.destination, result.file);
    }

    test('round-trips notes, metadata, IDs and encrypted attachments into a new local collection', async () => {
        const archive = await createBackup();
        const storage = path.join(root, 'fresh-computer');
        const result = await restoreCollection({ archive, storage, workspace: options.workspace });
        const restored = path.join(storage, result.collection);
        expect(result.collection).toBe('Work (restored)');
        expect(await fs.readFile(path.join(restored, 'markdown.md'), 'utf8'))
            .toContain('knowte://note/classic');
        expect(await fs.readFile(path.join(restored, 'markdown/image.png'))).toEqual(Buffer.from([0, 1, 2, 255]));
        expect(await fs.readFile(path.join(restored, 'encrypted/secret.png.enc'), 'utf8')).toBe('encrypted-attachment');
        const db = await fs.readJson(path.join(restored, `${result.collection}.db`));
        expect(db.filename).toBe(path.join(restored, `${result.collection}.db`));
        expect(db.collections[0].data[0].tags).toEqual(['work']);
        expect(db.collections[0].data[1].isTrashed).toBe(true);
        expect(db.collections[1].data[0].isArchived).toBe(true);
        const opened = new Loki(path.join(restored, `${result.collection}.db`));
        opened.loadJSON(JSON.stringify(db));
        expect(opened.getCollection('notes').findOne({ id: 'markdown' }).tags).toEqual(['work']);
        expect(await fs.pathExists(path.join(restored, 'manifest.json'))).toBe(false);
    });

    test('does not alter populated collections and picks a new name on repeated restores', async () => {
        const archive = await createBackup();
        const original = await fs.readFile(path.join(source, 'Work.db'));
        const first = await restoreCollection({ archive, storage: options.storage, workspace: options.workspace });
        await fs.outputFile(path.join(options.storage, first.collection, 'sentinel'), 'keep me');
        const second = await restoreCollection({ archive, storage: options.storage, workspace: options.workspace });
        expect(second.collection).toBe('Work (restored) 2');
        expect(await fs.readFile(path.join(source, 'Work.db'))).toEqual(original);
        expect(await fs.readFile(path.join(options.storage, first.collection, 'sentinel'), 'utf8')).toBe('keep me');
    });

    test('scheduled checks skip unchanged collections; manual backups do not', async () => {
        await createBackup();
        const skipped = await backupCollections(options);
        expect(skipped).toEqual([{ collection: 'Work', skipped: true }]);
        await createBackup({ force: true });
        expect((await fs.readdir(options.destination)).length).toBe(2);
    });

    test('uses timestamps to the second without identifiers and preserves same-second backups', async () => {
        const first = await createBackup({ force: true });
        const second = await createBackup({ force: true });
        expect(path.basename(first)).toMatch(/^Knowte-Work-\d{8}T\d{6}Z\.knowtebackup$/);
        expect(path.basename(second)).toMatch(/^Knowte-Work-\d{8}T\d{6}Z\.knowtebackup$/);
        expect(second).not.toBe(first);
        expect(await fs.pathExists(first)).toBe(true);
        expect(await fs.pathExists(second)).toBe(true);
    });

    test.each([false, true])('includes older identifier-based filenames in retention cleanup (aliased storage=%s)', async (aliased) => {
        if (aliased) {
            const alias = path.join(root, 'collections-alias');
            await fs.symlink(options.storage, alias, 'junction');
            options.storage = alias;
        }
        const id = require('crypto').createHash('sha256').update(source).digest('hex').slice(0, 16);
        const legacy = `Knowte-Work-${id}-2026-01-01T00-00-00-000Z-1234abcd.knowtebackup`;
        await fs.writeFile(path.join(options.destination, legacy), 'previous backup');
        const archive = await createBackup({ retention: 1 });
        expect(await fs.readdir(options.destination)).toEqual([path.basename(archive)]);
    });

    test('sorts basic and older dashed timestamps together for retention', async () => {
        const oldest = 'Knowte-Work-20250101T000000Z.knowtebackup';
        const newer = 'Knowte-Work-2026-01-01T00-00-00Z.knowtebackup';
        await fs.writeFile(path.join(options.destination, oldest), 'oldest');
        await fs.writeFile(path.join(options.destination, newer), 'newer');
        const archive = await createBackup({ retention: 2 });
        expect((await fs.readdir(options.destination)).sort()).toEqual([path.basename(archive), newer].sort());
    });

    test('trusts the revision token and skips even a corrupted destination archive that still exists', async () => {
        // Scheduled checks no longer hash the destination archive routinely; only the persistent
        // per-collection revision token is compared, then the archive's existence is checked. This
        // is an accepted limitation: run "Back up now" (force) to repair a corrupted archive.
        const archive = await createBackup();
        await fs.writeFile(archive, 'damaged cloud copy');
        const [result] = await backupCollections(options);
        expect(result.skipped).toBe(true);
        const repaired = await createBackup({ force: true });
        await extractAndVerify(repaired, path.join(root, 'checked'));
    });

    test('performs a fresh backup when the archive is missing even though the token is unchanged', async () => {
        const archive = await createBackup();
        await fs.unlink(archive);
        const [result] = await backupCollections(options);
        expect(result.skipped).toBe(false);
        expect(await fs.pathExists(archive)).toBe(true);
    });

    test('generates and persists a revision token for a collection that has none yet', async () => {
        await createBackup();
        const token = await fs.readJson(path.join(source, '.knowte-revision.json'));
        expect(token.version).toBe(1);
        expect(typeof token.revision).toBe('string');
        expect(token.revision.length).toBeGreaterThan(0);
    });

    test('does not skip and logs a warning when the revision token is malformed', async () => {
        await createBackup();
        await fs.writeFile(path.join(source, '.knowte-revision.json'), '{ not json');
        const warn = jest.fn();
        const [result] = await backupCollections(options, async () => {}, warn);
        expect(result.skipped).toBe(false);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('revision marker'));
        const token = await fs.readJson(path.join(source, '.knowte-revision.json'));
        expect(token.version).toBe(1);
    });

    test('does not warn about a merely missing revision token', async () => {
        const warn = jest.fn();
        await backupCollections(options, async () => {}, warn);
        expect(warn).not.toHaveBeenCalled();
    });

    test('performs a full backup again once the revision token changes', async () => {
        await createBackup();
        await fs.writeFile(path.join(source, '.knowte-revision.json'), JSON.stringify({ version: 1, revision: 'changed' }));
        const [result] = await backupCollections(options);
        expect(result.skipped).toBe(false);
        expect((await fs.readdir(options.destination)).filter((name) => name.endsWith('.knowtebackup'))).toHaveLength(2);
    });

    test('supports long collection names without overflowing backup or restored filenames', async () => {
        const collection = 'Very long collection name '.repeat(8).trim();
        const renamed = path.join(options.storage, collection);
        await fs.rename(source, renamed);
        await fs.rename(path.join(renamed, 'Work.db'), path.join(renamed, `${collection}.db`));
        const archive = await createBackup();
        expect(Buffer.byteLength(path.basename(archive))).toBeLessThan(255);
        const result = await restoreCollection({ archive, storage: options.storage, workspace: options.workspace });
        expect(await fs.pathExists(path.join(options.storage, result.collection, `${result.collection}.db`))).toBe(true);
    });
    test.each([0, 21, 1000, 1.5, NaN])('rejects retention %s without writing backups', async (retention) => {
        await expect(backupCollections({ ...options, retention })).rejects.toThrow('between 1 and 20');
        expect(await fs.readdir(options.destination)).toEqual([]);
    });

    test.each([1, 20])('accepts retention boundary %s', async (retention) => {
        const archive = await createBackup({ retention });
        expect(await fs.pathExists(archive)).toBe(true);
    });

    test('keeps the configured number of complete backups without deleting unrelated files', async () => {
        await fs.writeFile(path.join(options.destination, 'personal.zip'), 'untouched');
        await fs.writeFile(path.join(options.destination, 'old.knowtebackup.partial'), 'incomplete');
        for (let index = 0; index < 4; index++) {
            await createBackup({ force: true });
        }
        const names = await fs.readdir(options.destination);
        expect(names.filter((name) => name.endsWith('.knowtebackup'))).toHaveLength(2);
        expect(names).toContain('personal.zip');
        expect(names).toContain('old.knowtebackup.partial');
        expect((await fs.readdir(options.workspace)).filter((name) => name.startsWith('backup-'))).toEqual([]);
    });

    test('retries a changed snapshot instead of publishing mixed files', async () => {
        let calls = 0;
        const checkpoint = jest.fn(async () => {
            if (++calls === 2) {
                await fs.writeFile(path.join(source, 'markdown.md'), 'New content');
            }
            return calls < 2 ? 'old revision' : 'new revision';
        });
        const archive = await createBackup({}, checkpoint);
        expect(checkpoint).toHaveBeenCalledTimes(4);
        const restored = await restoreCollection({ archive, storage: options.storage, workspace: options.workspace });
        expect(await fs.readFile(path.join(options.storage, restored.collection, 'markdown.md'), 'utf8')).toBe('New content');
    });

    test('never publishes or prunes a backup if the collection keeps changing', async () => {
        await createBackup();
        let revision = 0;
        await expect(backupCollections({ ...options, force: true }, async () => `${++revision}`))
            .rejects.toThrow('kept changing');
        expect((await fs.readdir(options.destination)).filter((name) => name.endsWith('.knowtebackup'))).toHaveLength(1);
    });

    test.each(['classic.content', 'markdown.md', 'encrypted.md'])(
        'backs up and restores missing %s as-is with warnings', async (missing) => {
        await fs.unlink(path.join(source, missing));
        const originalDatabase = await fs.readFile(path.join(source, 'Work.db'));
        const warn = jest.fn();
        const [result] = await backupCollections(options, async () => {}, warn);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining(`expected "${missing}"`));
        const archive = path.join(options.destination, result.file);
        const verified = path.join(root, 'verified');
        const manifest = await extractAndVerify(archive, verified);
        expect(manifest.files.some((file) => file.path === missing)).toBe(false);
        expect(await fs.readFile(path.join(verified, 'Work.db'))).toEqual(originalDatabase);
        expect(await fs.readFile(path.join(source, 'Work.db'))).toEqual(originalDatabase);
        const restoreWarn = jest.fn();
        const restored = await restoreCollection({
            archive, storage: options.storage, workspace: options.workspace,
        }, restoreWarn);
        const restoredPath = path.join(options.storage, restored.collection);
        expect(await fs.pathExists(path.join(restoredPath, missing))).toBe(false);
        const db = await fs.readJson(path.join(restoredPath, `${restored.collection}.db`));
        expect(db.collections[0].data).toEqual(JSON.parse(originalDatabase.toString()).collections[0].data);
        expect(restoreWarn).toHaveBeenCalledWith(expect.stringContaining(`expected "${missing}"`));
        expect(await fs.pathExists(path.join(source, missing))).toBe(false);
    });

    test('does not overwrite backups if the destination is unavailable', async () => {
        const archive = await createBackup();
        await expect(backupCollections({ ...options, destination: path.join(root, 'unavailable') }))
            .rejects.toMatchObject({ code: 'ENOENT' });
        expect(await fs.pathExists(archive)).toBe(true);
    });

    test('rejects nested backup folders and symlink aliases of the collection', async () => {
        const nested = path.join(source, 'Backups');
        await fs.ensureDir(nested);
        await expect(backupCollections({ ...options, destination: nested })).rejects.toThrow('must be separate');
        const alias = path.join(root, 'alias');
        await fs.symlink(source, alias, 'dir');
        await expect(backupCollections({ ...options, destination: alias })).rejects.toThrow('must be separate');
    });

    test('rejects collection symlinks rather than following them', async () => {
        await fs.symlink(path.join(root, 'outside'), path.join(source, 'linked-file'));
        await expect(createBackup()).rejects.toThrow('Symbolic links');
    });

    test('rejects damaged archives before creating any restored collection', async () => {
        const archive = await createBackup();
        const extracted = path.join(root, 'tampered');
        await extractAndVerify(archive, extracted);
        await fs.writeFile(path.join(extracted, 'markdown.md'), 'tampered content');
        const damaged = path.join(root, 'damaged.knowtebackup');
        await new Promise((resolve, reject) => {
            const zip = archiver('zip');
            const output = fs.createWriteStream(damaged);
            output.on('close', resolve);
            output.on('error', reject);
            zip.on('error', reject);
            zip.pipe(output);
            zip.directory(extracted, false);
            zip.finalize();
        });
        await expect(restoreCollection({ archive: damaged, storage: options.storage, workspace: options.workspace }))
            .rejects.toThrow('verification failed');
        expect(await fs.readdir(options.storage)).toEqual(['Work']);
    });

    test('does not prune earlier backups or leave partial files when publishing fails', async () => {
        const original = await createBackup();
        const rename = fs.rename;
        const failingRename = jest.spyOn(fs, 'rename').mockImplementation(async (from, to) => {
            if (from.endsWith('.partial')) {
                throw new Error('Destination became unavailable');
            }
            return rename(from, to);
        });
        try {
            await expect(createBackup({ force: true, retention: 1 })).rejects.toThrow('became unavailable');
        } finally {
            failingRename.mockRestore();
        }
        expect(await fs.readdir(options.destination)).toEqual([path.basename(original)]);
    });

    test('rejects symlinks in restored archives before publishing a collection', async () => {
        const archive = path.join(root, 'unsafe.knowtebackup');
        await new Promise((resolve, reject) => {
            const zip = archiver('zip');
            const output = fs.createWriteStream(archive);
            output.on('close', resolve);
            output.on('error', reject);
            zip.on('error', reject);
            zip.pipe(output);
            zip.symlink('escape', '../outside');
            zip.finalize();
        });
        await expect(restoreCollection({ archive, storage: options.storage, workspace: options.workspace }))
            .rejects.toThrow('Unsafe entry');
        expect(await fs.readdir(options.storage)).toEqual(['Work']);
        expect(await fs.pathExists(path.join(root, 'outside'))).toBe(false);
    });

    test('runs backup work through the packaged worker entry point', async () => {
        await fs.outputFile(path.join(source, 'markdown/large.bin'), require('crypto').randomBytes(8 * 1024 * 1024));
        const delays = [];
        let previous = Date.now();
        const heartbeat = setInterval(() => {
            const now = Date.now();
            delays.push(now - previous);
            previous = now;
        }, 10);
        let result;
        try {
            result = await new Promise((resolve, reject) => {
                const worker = new Worker(path.join(__dirname, 'backup-worker.js'), {
                    workerData: { action: 'backup', options },
                });
                worker.on('error', reject);
                worker.on('message', (message) => {
                    if (message.checkpoint) {
                        worker.postMessage({ id: message.id, token: 'saved' });
                    } else if (message.error) {
                        reject(new Error(message.error));
                    } else {
                        resolve(message.result);
                    }
                });
            });
        } finally {
            clearInterval(heartbeat);
        }
        expect(result[0].file).toMatch(/\.knowtebackup$/);
        expect(await fs.pathExists(path.join(options.destination, result[0].file))).toBe(true);
        expect(delays.length).toBeGreaterThan(2);
        expect(Math.max(...delays)).toBeLessThan(250);
    });
});
