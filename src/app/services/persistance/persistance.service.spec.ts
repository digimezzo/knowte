import { It, Mock, Times } from 'typemoq';
import { Desktop } from '../../common/io/desktop';
import { FileAccess } from '../../common/io/file-access';
import { Logger } from '../../common/logging/logger';
import { BaseSettings } from '../../common/settings/base-settings';
import { CollectionFileAccess } from '../collection/collection-file-access';
import { CryptographyService } from '../cryptography/cryptography.service';
import { TemporaryStorageService } from '../temporary-storage/temporary-storage.service';
import { PersistanceService } from './persistance.service';

jest.mock('@electron/remote', () => ({}));
jest.mock('nanoid', () => ({ nanoid: () => 'note' }));

describe('PersistanceService asynchronous attachment access', () => {
    const files = Mock.ofType<FileAccess>();
    const collectionFiles = Mock.ofType<CollectionFileAccess>();
    const crypto = Mock.ofType<CryptographyService>();
    let service: PersistanceService;
    let writes: jest.Mock;

    beforeEach(() => {
        files.reset();
        collectionFiles.reset();
        crypto.reset();
        const settings = Mock.ofType<BaseSettings>();
        settings.setup((x) => x.activeCollection).returns(() => 'collection');
        const temporaryStorage = Mock.ofType<TemporaryStorageService>();
        temporaryStorage.setup((x) => x.getTemporaryStorageDirectoryPath()).returns(() => '/tmp');
        files.setup((x) => x.combinePath(It.isAny(), It.isAny(), It.isAny(), It.isAny()))
            .returns((...parts: string[]) => parts.join('/'));
        files.setup((x) => x.combinePath(It.isAny(), It.isAny()))
            .returns((...parts: string[]) => parts.join('/'));
        files.setup((x) => x.pathExists(It.isAnyString())).throws(new Error('Blocking disk access'));
        files.setup((x) => x.deleteDirectoryRecursively(It.isAnyString())).throws(new Error('Blocking disk access'));
        files.setup((x) => x.createFullDirectoryPathIfDoesNotExist(It.isAnyString())).throws(new Error('Blocking disk access'));
        files.setup((x) => x.pathExistsAsync(It.isAnyString())).returns(async () => true);
        files.setup((x) => x.deleteDirectoryRecursivelyAsync(It.isAnyString())).returns(async () => undefined);
        files.setup((x) => x.createFullDirectoryPathIfDoesNotExistAsync(It.isAnyString())).returns(async () => undefined);
        files.setup((x) => x.getFileName(It.isAnyString())).returns((path: string) => path.split('/').pop());
        files.setup((x) => x.getFileContentAsBufferAsync(It.isAnyString())).returns(async () => Buffer.from('encrypted'));
        files.setup((x) => x.deleteFileIfExistsAsync(It.isAnyString())).returns(async () => undefined);
        writes = jest.fn().mockResolvedValue(undefined);
        files.setup((x) => x.writeBufferToFileAsync(It.isAnyString(), It.isAny())).returns(writes);
        collectionFiles.setup((x) => x.getNoteAttachmentsDirectoryPath('note', 'collection')).returns(() => '/storage/note');
        collectionFiles.setup((x) => x.saveNoteContentAsync(It.isAny(), It.isAny(), It.isAny(), It.isAny()))
            .returns(async () => undefined);
        crypto.setup((x) => x.encrypt(It.isAnyString(), It.isAnyString())).returns(() => 'encrypted content');
        crypto.setup((x) => x.encryptBuffer(It.isAny(), It.isAnyString())).returns(() => Buffer.from('encrypted'));
        crypto.setup((x) => x.decryptBuffer(It.isAny(), It.isAnyString())).returns(() => Buffer.from('decrypted'));
        service = new PersistanceService(collectionFiles.object, crypto.object, settings.object, files.object, temporaryStorage.object);
    });

    it('loads encrypted attachment previews without synchronous filesystem calls', async () => {
        files.setup((x) => x.getFilesInDirectoryAsync('/storage/note')).returns(async () => ['/storage/note/image.png.enc']);

        expect(await service.getNoteAttachmentsDirectoryPathForPreviewAsync('note', true, 'key', true))
            .toBe('/tmp/decrypted-markdown-attachments/collection/note');
        expect(writes).toHaveBeenCalledWith('/tmp/decrypted-markdown-attachments/collection/note/image.png', Buffer.from('decrypted'));
        files.verify((x) => x.createFullDirectoryPathIfDoesNotExistAsync('/tmp/decrypted-markdown-attachments/collection/note'), Times.once());
    });

    it('cleans up previews asynchronously for unencrypted notes', async () => {
        expect(await service.getNoteAttachmentsDirectoryPathForPreviewAsync('note', false, '', true)).toBe('/storage/note');
        files.verify((x) => x.deleteDirectoryRecursivelyAsync('/tmp/decrypted-markdown-attachments/collection/note'), Times.once());
    });

    it('resolves the temporary preview path without creating directories synchronously', () => {
        const desktop = Mock.ofType<Desktop>();
        desktop.setup((x) => x.applicationDataDirectoryPath()).returns(() => '/userdata');
        const temporaryStorage = new TemporaryStorageService(files.object, desktop.object, Mock.ofType<Logger>().object);

        expect(temporaryStorage.getTemporaryStorageDirectoryPath()).toBe('/userdata/TemporaryStorage');
        files.verify((x) => x.createFullDirectoryPathIfDoesNotExist(It.isAnyString()), Times.never());
    });

    it.each([true, false])('saves attachment encryption changes asynchronously (encrypted=%s)', async (encrypted) => {
        const source = encrypted ? '/storage/note/image.png' : '/storage/note/image.png.enc';
        files.setup((x) => x.getFilesInDirectoryAsync('/storage/note')).returns(async () => [source]);
        collectionFiles.setup((x) => x.markCollectionChangedAsync('collection')).returns(async () => undefined);

        await service.updateNoteContentAsync('note', 'content', encrypted, 'key', true);

        expect(writes).toHaveBeenCalledWith(
            encrypted ? '/storage/note/image.png.enc' : '/storage/note/image.png',
            Buffer.from(encrypted ? 'encrypted' : 'decrypted'),
        );
        files.verify((x) => x.deleteFileIfExistsAsync(source), Times.once());
        collectionFiles.verify((x) => x.markCollectionChangedAsync('collection'), Times.once());
    });

    it('propagates attachment access failures instead of reporting a successful save', async () => {
        const error = new Error('Storage unavailable');
        files.reset();
        files.setup((x) => x.pathExistsAsync('/storage/note')).returns(() => Promise.reject(error));

        await expect(service.updateNoteContentAsync('note', 'content', false, '', true)).rejects.toBe(error);
    });
});
