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
