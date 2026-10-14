import { It, Mock, Times } from 'typemoq';
import { FileAccess } from '../../common/io/file-access';
import { Logger } from '../../common/logging/logger';
import { BaseSettings } from '../../common/settings/base-settings';
import { CollectionFileAccess } from './collection-file-access';

describe('CollectionFileAccess deleteNoteFilesAsync', () => {
    it.each([true, false])('deletes content and state without an attachments directory (markdown=%s)', async (markdown) => {
        const files = Mock.ofType<FileAccess>();
        const settings = Mock.ofType<BaseSettings>();
        settings.setup((x) => x.storageDirectory).returns(() => '/storage');
        files.setup((x) => x.combinePath(It.isAny(), It.isAny())).returns((parent: string, child: string) => `${parent}/${child}`);
        files.setup((x) => x.pathExists(It.isAnyString())).returns(() => false);
        files.setup((x) => x.deleteFileIfExistsAsync(It.isAnyString())).returns(async () => undefined);
        const service = new CollectionFileAccess(files.object, settings.object, Mock.ofType<Logger>().object);
        const contentPath = service.getNoteContentFilePath('note-id', 'collection', markdown);

        await service.deleteNoteFilesAsync('note-id', 'collection', markdown);

        files.verify((x) => x.deleteFileIfExistsAsync(contentPath), Times.once());
        files.verify((x) => x.deleteDirectoryRecursively(It.isAnyString()), Times.never());
    });

    describe('CollectionFileAccess saving note images', () => {
        it('waits for directory creation and the image write before reporting success', async () => {
            const files = Mock.ofType<FileAccess>();
            const settings = Mock.ofType<BaseSettings>();
            settings.setup((x) => x.storageDirectory).returns(() => '/storage');
            files.setup((x) => x.combinePath(It.isAny(), It.isAny())).returns((parent: string, child: string) => `${parent}/${child}`);
            let createDirectory: () => void;
            files.setup((x) => x.createFullDirectoryPathIfDoesNotExistAsync('/storage/collection/note'))
                .returns(() => new Promise<void>((resolve) => { createDirectory = resolve; }));
            let finishWrite: () => void;
            const writeStarted = new Promise<void>((resolve) => {
                files.setup((x) => x.writeBufferToFileAsync('/storage/collection/note/image.png', It.isAny()))
                    .returns(() => {
                        resolve();
                        return new Promise<void>((finish) => { finishWrite = finish; });
                    });
            });
            const service = new CollectionFileAccess(files.object, settings.object, Mock.ofType<Logger>().object);
            let completed = false;
            const save = service.createNoteImageFileAsync('note', 'collection', Buffer.from('image'), 'image').then(() => {
                completed = true;
            });

            files.verify((x) => x.writeBufferToFileAsync(It.isAnyString(), It.isAny()), Times.never());
            createDirectory();
            await writeStarted;
            expect(completed).toBe(false);
            finishWrite();
            await save;
            expect(completed).toBe(true);
            files.verify((x) => x.createFullDirectoryPathIfDoesNotExist(It.isAnyString()), Times.never());
        });

        it('propagates image write errors', async () => {
            const files = Mock.ofType<FileAccess>();
            files.setup((x) => x.createFullDirectoryPathIfDoesNotExistAsync(It.isAny())).returns(async () => undefined);
            const error = new Error('Cannot write image');
            files.setup((x) => x.writeBufferToFileAsync(It.isAny(), It.isAny())).returns(() => Promise.reject(error));
            const service = new CollectionFileAccess(files.object, Mock.ofType<BaseSettings>().object, Mock.ofType<Logger>().object);

            await expect(service.createNoteImageFileAsync('note', 'collection', Buffer.from('image'), 'image')).rejects.toBe(error);
        });
    });

    it('deletes the attachments directory when it exists', async () => {
        const files = Mock.ofType<FileAccess>();
        const settings = Mock.ofType<BaseSettings>();
        settings.setup((x) => x.storageDirectory).returns(() => '/storage');
        files.setup((x) => x.combinePath(It.isAny(), It.isAny())).returns((parent: string, child: string) => `${parent}/${child}`);
        files.setup((x) => x.pathExists(It.isAnyString())).returns(() => true);
        files.setup((x) => x.deleteFileIfExistsAsync(It.isAnyString())).returns(async () => undefined);
        const service = new CollectionFileAccess(files.object, settings.object, Mock.ofType<Logger>().object);

        await service.deleteNoteFilesAsync('note-id', 'collection', true);

        files.verify((x) => x.deleteDirectoryRecursively('/storage/collection/note-id'), Times.once());
    });
});
