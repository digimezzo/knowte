const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const archiver = require('archiver');
const extract = require('extract-zip');
const sanitize = require('sanitize-filename');
const { pipeline } = require('stream/promises');

const extension = '.knowtebackup';
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');

async function hashFile(file) {
    const hash = crypto.createHash('sha256');
    for await (const chunk of fs.createReadStream(file)) {
        hash.update(chunk);
    }
    return hash.digest('hex');
}

function safeRelativePath(value) {
    return typeof value === 'string' && value.length > 0 &&
        !value.includes('\\') && !value.includes(':') && !value.includes('\0') &&
        value.split('/').every((part) => part && part !== '.' && part !== '..');
}

async function inventory(directory, prefix = '') {
    const files = [];
    for (const name of (await fs.readdir(directory)).sort()) {
        const relative = prefix ? `${prefix}/${name}` : name;
        if (!safeRelativePath(relative)) {
            throw new Error(`Unsupported backup path: ${relative}`);
        }
        const absolute = path.join(directory, name);
        const stat = await fs.lstat(absolute);
        if (stat.isSymbolicLink()) {
            throw new Error(`Symbolic links cannot be backed up: ${relative}`);
        }
        if (stat.isDirectory()) {
            files.push(...await inventory(absolute, relative));
        } else if (stat.isFile()) {
            files.push({ path: relative, size: stat.size, sha256: await hashFile(absolute) });
        } else {
            throw new Error(`Unsupported file: ${relative}`);
        }
    }
    return files;
}

function sameFiles(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}

async function validateDatabase(directory, database, warn) {
    if (!safeRelativePath(database) || database.includes('/')) {
        throw new Error('Invalid collection database path.');
    }
    const db = await fs.readJson(path.join(directory, database));
    if (!Array.isArray(db.collections)) {
        throw new Error('Invalid collection database.');
    }
    const notes = db.collections.find((collection) => collection.name === 'notes');
    const notebooks = db.collections.find((collection) => collection.name === 'notebooks');
    if (!notes || !notebooks || !Array.isArray(notes.data) || !Array.isArray(notebooks.data)) {
        throw new Error('The backup is missing notes or notebooks.');
    }
    const ids = new Set();
    for (const note of notes.data) {
        if (!safeRelativePath(note.id) || note.id.includes('/') || ids.has(note.id)) {
            throw new Error('Invalid or duplicate note ID.');
        }
        ids.add(note.id);
        const file = path.join(directory, `${note.id}${note.isMarkdownNote ? '.md' : '.content'}`);
        if (warn && !(await fs.pathExists(file))) {
            warn(`Missing content for note ${note.id} in database "${database}": expected "${path.basename(file)}". Preserving the collection as-is.`);
        }
    }
    return db;
}

async function createArchive(directory, destination) {
    const archive = archiver('zip', { zlib: { level: 3 } });
    const output = fs.createWriteStream(destination, { flags: 'wx' });
    const completed = pipeline(archive, output);
    archive.on('warning', (error) => archive.destroy(error));
    archive.directory(directory, false);
    try {
        await Promise.all([archive.finalize(), completed]);
    } catch (error) {
        archive.destroy();
        output.destroy();
        throw error;
    }
}

async function extractAndVerify(archive, directory) {
    await extract(archive, {
        dir: directory,
        onEntry: (entry) => {
            const entryPath = entry.fileName.replace(/\/$/, '');
            const mode = (entry.externalFileAttributes >>> 16) & 0o170000;
            if (!safeRelativePath(entryPath) || mode === 0o120000) {
                throw new Error('Unsafe entry in backup archive.');
            }
        },
    });
    const manifest = await fs.readJson(path.join(directory, 'manifest.json'));
    if (manifest.format !== 'knowte-backup' || manifest.version !== 1 ||
        typeof manifest.collection !== 'string' || typeof manifest.createdAt !== 'string' ||
        !Number.isFinite(Date.parse(manifest.createdAt)) || !Array.isArray(manifest.files) ||
        !manifest.files.every((file) => safeRelativePath(file.path) &&
            Number.isSafeInteger(file.size) && file.size >= 0 && /^[a-f0-9]{64}$/.test(file.sha256))) {
        throw new Error('Unsupported or invalid Knowte backup.');
    }
    const actual = (await inventory(directory)).filter((file) => file.path !== 'manifest.json');
    if (!sameFiles(actual, manifest.files)) {
        throw new Error('Backup verification failed: missing, unexpected, or damaged files.');
    }
    await validateDatabase(directory, manifest.database);
    return manifest;
}

async function separateDestination(storage, destination) {
    const source = await fs.realpath(storage);
    const target = await fs.realpath(destination);
    const isInside = (parent, child) => {
        const relative = path.relative(parent, child);
        return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
    };
    if (isInside(source, target) || isInside(target, source)) {
        throw new Error('The backup folder and collections folder must be separate, not inside one another.');
    }
    return { source, target };
}

async function backupCollections(options, checkpoint = async () => {}, warn = console.warn) {
    const { storage, destination, retention, workspace } = options;
    if (!Number.isInteger(retention) || retention < 1 || retention > 20) {
        throw new Error('Keep between 1 and 20 backups per collection.');
    }
    const { source, target } = await separateDestination(storage, destination);
    await fs.ensureDir(workspace);
    const results = [];
    for (const collection of (await fs.readdir(source)).sort()) {
        const collectionPath = path.join(source, collection);
        if (!(await fs.lstat(collectionPath)).isDirectory()) {
            continue;
        }
        const database = `${collection}.db`;
        if (!(await fs.pathExists(path.join(collectionPath, database)))) {
            continue;
        }
        const id = digest(collectionPath).slice(0, 16);
        const temporary = await fs.mkdtemp(path.join(workspace, 'backup-'));
        let publishing;
        try {
            const snapshot = path.join(temporary, 'snapshot');
            let files;
            let stable = false;
            for (let attempt = 0; attempt < 3; attempt++) {
                const beforeToken = await checkpoint(collection);
                await fs.remove(snapshot);
                await fs.ensureDir(snapshot);
                try {
                    const before = await inventory(collectionPath);
                    for (const file of before) {
                        const output = path.join(snapshot, file.path);
                        await fs.ensureDir(path.dirname(output));
                        await fs.copyFile(path.join(collectionPath, file.path), output);
                    }
                    files = await inventory(snapshot);
                    const afterToken = await checkpoint(collection);
                    const after = await inventory(collectionPath);
                    if (beforeToken === afterToken && sameFiles(before, files) && sameFiles(files, after)) {
                        await validateDatabase(snapshot, database, warn);
                        stable = true;
                        break;
                    }
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        throw error;
                    }
                }
                await delay(1000);
            }
            if (!stable) {
                throw Object.assign(new Error(`Collection "${collection}" kept changing. Backup will be retried later.`),
                    { code: 'BACKUP_POSTPONED' });
            }
            const label = Array.from(sanitize(collection)).slice(0, 40).join('');
            const prefix = `Knowte-${label}-`;
            let createdAt;
            let file;
            do {
                createdAt = new Date().toISOString();
                file = `${prefix}${createdAt.slice(0, 19).replace(/[-:]/g, '')}Z${extension}`;
                if (!await fs.pathExists(path.join(target, file)) &&
                    !await fs.pathExists(path.join(target, `${file}.partial`))) {
                    break;
                }
                await delay(1000);
            } while (true);
            await fs.writeJson(path.join(snapshot, 'manifest.json'), {
                format: 'knowte-backup', version: 1, collection, database, createdAt, files,
            });
            const local = path.join(temporary, file);
            await createArchive(snapshot, local);
            // Verify the actual archive, not just the files supplied to the ZIP writer.
            await extractAndVerify(local, path.join(temporary, 'verified'));
            publishing = path.join(target, `${file}.partial`);
            await fs.copyFile(local, publishing, fs.constants.COPYFILE_EXCL);
            const archiveSha256 = await hashFile(local);
            if (archiveSha256 !== await hashFile(publishing)) {
                throw new Error('The backup copy failed verification.');
            }
            const handle = await fs.open(publishing, 'r+');
            try {
                await fs.fsync(handle);
            } finally {
                await fs.close(handle);
            }
            await fs.rename(publishing, path.join(target, file));
            publishing = undefined;
            const owned = (await fs.readdir(target))
                .filter((name) => name !== file && name.startsWith(prefix) && name.endsWith(extension) &&
                    (/^(?:\d{8}T\d{6}Z|\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z)\.knowtebackup$/.test(name.slice(prefix.length)) ||
                        name.startsWith(`${prefix}${id}-`)))
                .sort((left, right) => {
                    const timestamp = (name) => name.slice(prefix.length)
                        .replace(new RegExp(`^${id}-`), '').split('Z')[0].replace(/\D/g, '').slice(0, 14);
                    return timestamp(right).localeCompare(timestamp(left));
                });
            for (const expired of owned.slice(retention - 1)) {
                await fs.unlink(path.join(target, expired));
            }
            results.push({ collection, file, createdAt, skipped: false });
        } finally {
            if (publishing) {
                await fs.remove(publishing);
            }
            await fs.remove(temporary);
        }
    }
    if (results.length === 0) {
        throw new Error('No saved collections were found to back up.');
    }
    return results;
}

async function restoreCollection({ archive, storage, workspace }, warn = console.warn) {
    await fs.ensureDir(workspace);
    const temporary = await fs.mkdtemp(path.join(workspace, 'restore-'));
    let staged;
    try {
        const extracted = path.join(temporary, 'extracted');
        const manifest = await extractAndVerify(archive, extracted);
        const label = Array.from(sanitize(manifest.collection).trim()).slice(0, 50).join('');
        if (!label) {
            throw new Error('Invalid collection name in backup.');
        }
        const base = `${label} (restored)`;
        await fs.ensureDir(storage);
        staged = await fs.mkdtemp(path.join(storage, '.knowte-restore-'));
        await fs.copy(extracted, staged, { overwrite: false, errorOnExist: true });
        await fs.unlink(path.join(staged, 'manifest.json'));
        const db = await validateDatabase(staged, manifest.database, warn);
        let stagedDatabase = manifest.database;
        let name = base;
        for (let index = 2; ; index++) {
            const destination = path.join(storage, name);
            if (await fs.pathExists(destination)) {
                name = `${base} ${index}`;
                continue;
            }
            const nextDatabase = `${name}.db`;
            db.filename = path.join(destination, nextDatabase);
            await fs.writeJson(path.join(staged, stagedDatabase), db);
            if (stagedDatabase !== nextDatabase) {
                await fs.rename(path.join(staged, stagedDatabase), path.join(staged, nextDatabase));
                stagedDatabase = nextDatabase;
            }
            try {
                await fs.move(staged, destination, { overwrite: false });
                break;
            } catch (error) {
                if (!await fs.pathExists(destination)) {
                    throw error;
                }
                name = `${base} ${index}`;
            }
        }
        return { collection: name, createdAt: manifest.createdAt };
    } finally {
        if (staged) {
            await fs.remove(staged);
        }
        await fs.remove(temporary);
    }
}

module.exports = { backupCollections, restoreCollection, inventory, extractAndVerify };
