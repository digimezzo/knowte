import * as crypto from 'crypto';
import { FileAccess } from '../../common/io/file-access';

/**
 * Name of the persistent, per-collection revision marker file. Automatic backups compare its
 * content against the revision they last backed up, before doing any copying or hashing of the
 * collection, to decide cheaply whether a scheduled check can be skipped.
 */
export const collectionRevisionFileName: string = '.knowte-revision.json';

/**
 * Marks a collection as changed by writing a fresh random revision to its persistent revision
 * marker, atomically (write to a temporary file, then rename over the existing one). Every
 * surface that mutates backed-up data (note content, attachments, database metadata, rename,
 * import, move, delete, ...) must call this conservatively, before performing its write, so that
 * an interruption still leaves behind a token that differs from the last backed-up revision.
 */
export async function markCollectionChangedAsync(fileAccess: FileAccess, collectionDirectoryPath: string): Promise<void> {
    const revisionFilePath: string = fileAccess.combinePath(collectionDirectoryPath, collectionRevisionFileName);
    const temporaryFilePath: string = `${revisionFilePath}.tmp`;
    const revisionToken: string = JSON.stringify({ version: 1, revision: crypto.randomUUID() });

    await fileAccess.writeTextToFileAsync(temporaryFilePath, revisionToken);
    fileAccess.renameFileOrDirectory(temporaryFilePath, revisionFilePath);
}
