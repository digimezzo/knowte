import { It, Mock, Times } from 'typemoq';
import { FileAccess } from '../../common/io/file-access';
import { Logger } from '../../common/logging/logger';
import { BaseSettings } from '../../common/settings/base-settings';
import { CollectionFileAccess } from './collection-file-access';

describe('CollectionFileAccess deleteNoteFilesAsync', () => {
    it('does not expose incomplete restore staging directories as collections', async () => {
        const files = Mock.ofType<FileAccess>();
        const settings = Mock.ofType<BaseSettings>();
        settings.setup((value) => value.storageDirectory).returns(() => '/storage');
        files.setup((value) => value.getDirectoriesInDirectoryAsync('/storage'))
            .returns(async () => ['/storage/Work', '/storage/.knowte-restore-staging', '/storage/.knowte-restore-personal']);
        files.setup((value) => value.getDirectoryOrFileName(It.isAnyString()))
            .returns((value: string) => value.split('/').pop());
        files.setup((value) => value.combinePath(It.isAnyString(), It.isAnyString(), It.isAnyString()))
            .returns((parent: string, name: string, file: string) => `${parent}/${name}/${file}`);
        files.setup((value) => value.pathExists('/storage/.knowte-restore-personal/.knowte-restore-personal.db'))
            .returns(() => true);
        const service = new CollectionFileAccess(files.object, settings.object, Mock.ofType<Logger>().object);
        expect(await service.getCollectionsAsync()).toEqual(['Work', '.knowte-restore-personal']);
    });
    it('includes tags in classic note exports', async () => {
        const files = Mock.ofType<FileAccess>();
        let exported: string;
        files.setup((x) => x.writeTextToFileAsync('/export', It.isAnyString()))
            .returns(async (_path, content) => { exported = content; });
        const service = new CollectionFileAccess(files.object, Mock.ofType<BaseSettings>().object, Mock.ofType<Logger>().object);

        await service.exportNoteAsync('/export', 'note', 'Title', 'Text', 'Content', false, ['work', 'project alpha']);

        expect(JSON.parse(exported)).toEqual({
            title: 'Title', text: 'Text', content: 'Content', tags: ['work', 'project alpha'],
        });
    });

    it('includes tags in Markdown export metadata', async () => {
        const files = Mock.ofType<FileAccess>();
        const settings = Mock.ofType<BaseSettings>();
        settings.setup((x) => x.storageDirectory).returns(() => '/storage');
        settings.setup((x) => x.activeCollection).returns(() => 'collection');
        files.setup((x) => x.combinePath(It.isAny(), It.isAny())).returns((parent, child) => `${parent}/${child}`);
        const service = new CollectionFileAccess(files.object, settings.object, Mock.ofType<Logger>().object);
        const createZip = jest.fn().mockResolvedValue(undefined);
        service['createZipAsync'] = createZip;

        await service.exportNoteAsync('/export', 'note', 'Title', 'Text', 'Content', true, ['work']);

        expect(createZip).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'Title', tags: ['work'] }),
            service.getNoteContentFilePath('note', 'collection', true),
            service.getNoteAttachmentsDirectoryPath('note', 'collection'),
            '/export',
        );
    });

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
            files.setup((x) => x.writeTextToFileAsync(It.isAnyString(), It.isAnyString())).returns(async () => undefined);
            files.setup((x) => x.renameFileOrDirectory(It.isAnyString(), It.isAnyString())).returns(() => undefined);
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

            // Flush the microtasks used by the (mocked) collection-changed marker write before the
            // directory-creation promise resolver is captured.
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();

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

    describe('marking the collection as changed before mutating backed-up data', () => {
        function setupFiles(): ReturnType<typeof Mock.ofType<FileAccess>> {
            const files = Mock.ofType<FileAccess>();
            files.setup((x) => x.combinePath(It.isAny(), It.isAny())).returns((parent: string, child: string) => `${parent}/${child}`);
            files.setup((x) => x.writeTextToFileAsync(It.isAnyString(), It.isAnyString())).returns(async () => undefined);
            files.setup((x) => x.renameFileOrDirectory(It.isAnyString(), It.isAnyString())).returns(() => undefined);
            files.setup((x) => x.writeBufferToFileAsync(It.isAnyString(), It.isAny())).returns(async () => undefined);
            files.setup((x) => x.createFullDirectoryPathIfDoesNotExistAsync(It.isAnyString())).returns(async () => undefined);
            files.setup((x) => x.createFullDirectoryPathIfDoesNotExist(It.isAnyString())).returns(() => undefined);
            files.setup((x) => x.pathExists(It.isAnyString())).returns(() => false);
            files.setup((x) => x.pathExistsAsync(It.isAnyString())).returns(async () => false);
            files.setup((x) => x.deleteFileIfExistsAsync(It.isAnyString())).returns(async () => undefined);
            files.setup((x) => x.copyFileOrDirectoryAsync(It.isAnyString(), It.isAnyString())).returns(async () => undefined);
            return files;
        }

        it('writes a fresh revision token before saving note content', async () => {
            const files = setupFiles();
            const settings = Mock.ofType<BaseSettings>();
            settings.setup((x) => x.storageDirectory).returns(() => '/storage');
            const service = new CollectionFileAccess(files.object, settings.object, Mock.ofType<Logger>().object);

            await service.saveNoteContentAsync('note', 'content', 'collection', false);

            files.verify(
                (x) => x.writeTextToFileAsync('/storage/collection/.knowte-revision.json.tmp', It.isAnyString()),
                Times.once(),
            );
            files.verify(
                (x) =>
                    x.renameFileOrDirectory(
                        '/storage/collection/.knowte-revision.json.tmp',
                        '/storage/collection/.knowte-revision.json',
                    ),
                Times.once(),
            );
        });

        it('writes a fresh revision token before creating an attachment directory', async () => {
            const files = setupFiles();
            const settings = Mock.ofType<BaseSettings>();
            settings.setup((x) => x.storageDirectory).returns(() => '/storage');
            const service = new CollectionFileAccess(files.object, settings.object, Mock.ofType<Logger>().object);

            await service.createNoteImageFileAsync('note', 'collection', Buffer.from('image'), 'image');

            files.verify(
                (x) => x.writeTextToFileAsync('/storage/collection/.knowte-revision.json.tmp', It.isAnyString()),
                Times.once(),
            );
        });

        it('does not write a revision token when there are no attachments to clean up', async () => {
            const files = setupFiles();
            const settings = Mock.ofType<BaseSettings>();
            settings.setup((x) => x.storageDirectory).returns(() => '/storage');
            const service = new CollectionFileAccess(files.object, settings.object, Mock.ofType<Logger>().object);

            await service.deleteUnusedNoteAttachmentsAsync('note', 'collection', 'text');

            files.verify((x) => x.writeTextToFileAsync(It.isAnyString(), It.isAnyString()), Times.never());
        });

        it('writes a fresh revision token before renaming collection files', async () => {
            const files = setupFiles();
            const settings = Mock.ofType<BaseSettings>();
            settings.setup((x) => x.storageDirectory).returns(() => '/storage');
            const service = new CollectionFileAccess(files.object, settings.object, Mock.ofType<Logger>().object);

            await service.renameCollectionFiles('old', 'new');

            files.verify(
                (x) => x.writeTextToFileAsync('/storage/old/.knowte-revision.json.tmp', It.isAnyString()),
                Times.once(),
            );
            files.verify((x) => x.renameFileOrDirectory('/storage/old', '/storage/new'), Times.once());
        });
    });
});

