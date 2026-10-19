const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const archiver = require('archiver');
const extract = require('extract-zip');
const sanitize = require('sanitize-filename');
const { pipeline } = require('stream/promises');

const extension = '.knowtebackup';
// Persistent, per-collection marker. Every surface that mutates backed-up data (note content,
// attachments, database metadata, rename/import/move/delete, ...) writes a fresh random revision
// here *before* performing its write, so an interruption still leaves behind a changed token.
// Scheduled backups compare this token against the last backed-up revision before doing any
// copying or hashing, and only skip cheaply (existence check) when both match.
const revisionFileName = '.knowte-revision.json';
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

async function writeNewRevisionToken(collectionPath) {
    const revisionPath = path.join(collectionPath, revisionFileName);
    const temporary = `${revisionPath}.tmp`;
    const revision = crypto.randomUUID();
    await fs.writeJson(temporary, { version: 1, revision });
    await fs.rename(temporary, revisionPath);
    return revision;
}

// Reads the collection's persistent revision token. A missing token is the normal case for a
// collection that has never been backed up with this feature (or ever) and is silently created.
// A token that exists but cannot be parsed or does not match the expected shape is explicitly
// logged, never silently skipped, and is self-healed so future checks can trust it again.
async function readOrInitRevisionToken(collectionPath, warn) {
    const revisionPath = path.join(collectionPath, revisionFileName);
    let token;
    try {
        token = await fs.readJson(revisionPath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            warn(`Collection revision marker "${revisionFileName}" in "${collectionPath}" could not be read (${error.message}). Treating the collection as changed.`);
            return { revision: await writeNewRevisionToken(collectionPath), trustworthy: false };
        }
        return { revision: await writeNewRevisionToken(collectionPath), trustworthy: false };
    }
    if (!token || token.version !== 1 || typeof token.revision !== 'string' || token.revision.length === 0) {
        warn(`Collection revision marker "${revisionFileName}" in "${collectionPath}" is malformed. Treating the collection as changed.`);
        return { revision: await writeNewRevisionToken(collectionPath), trustworthy: false };
    }
    return { revision: token.revision, trustworthy: true };
}

async function backupCollections(options, checkpoint = async () => {}, warn = console.warn) {
    const { storage, destination, retention, workspace } = options;
    if (!Number.isInteger(retention) || retention < 1 || retention > 20) {
        throw new Error('Keep between 1 and 20 backups per collection.');
    }
    const { source, target } = await separateDestination(storage, destination);
    await fs.ensureDir(workspace);
    const statePath = path.join(workspace, 'state.json');
    const state = await fs.pathExists(statePath) ? await fs.readJson(statePath) : {};
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
        // Compare the persistent revision token with the last backed-up revision *before* doing
        // any copying or hashing of the collection. A missing or malformed token always forces a
        // full backup (and self-heals); only a confirmed match may take the cheap skip path.
        // Note: this trusts the on-disk token and cannot detect changes made to collection files
        // while Knowte was closed (for example by restoring an external copy out of band).
        const revisionToken = await readOrInitRevisionToken(collectionPath, warn);
        if (!options.force && revisionToken.trustworthy && state[id] && state[id].lastRevision === revisionToken.revision) {
            await checkpoint(collection);
            const confirmedToken = await readOrInitRevisionToken(collectionPath, warn);
            if (confirmedToken.trustworthy && confirmedToken.revision === state[id].lastRevision &&
                state[id].file && await fs.pathExists(path.join(target, state[id].file))) {
                results.push({ collection, skipped: true });
                continue;
            }
        }
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
            // Capture the revision token from the stable snapshot itself, not by re-reading the
            // live collection: only this exact, already-copied state is what gets archived below,
            // so any edit arriving after this point must remain pending for a future backup.
            let capturedRevision;
            try {
                capturedRevision = (await fs.readJson(path.join(snapshot, revisionFileName))).revision;
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
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
            state[id] = { lastRevision: capturedRevision, file, createdAt, archiveSha256 };
            const stateTemporary = `${statePath}.tmp`;
            await fs.writeJson(stateTemporary, state);
            await fs.rename(stateTemporary, statePath);
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
