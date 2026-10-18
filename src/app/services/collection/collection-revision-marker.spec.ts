import { It, Mock, Times } from 'typemoq';
import { FileAccess } from '../../common/io/file-access';
import { collectionRevisionFileName, markCollectionChangedAsync } from './collection-revision-marker';

describe('markCollectionChangedAsync', () => {
    it('writes a fresh revision token atomically, via a temporary file and rename', async () => {
        const files = Mock.ofType<FileAccess>();
        files.setup((x) => x.combinePath('/storage/collection', collectionRevisionFileName))
            .returns((parent: string, child: string) => `${parent}/${child}`);
        let writtenContent: string;
        files.setup((x) => x.writeTextToFileAsync('/storage/collection/.knowte-revision.json.tmp', It.isAnyString()))
            .returns(async (_path: string, content: string) => {
                writtenContent = content;
            });

        await markCollectionChangedAsync(files.object, '/storage/collection');

        files.verify(
            (x) => x.renameFileOrDirectory('/storage/collection/.knowte-revision.json.tmp', '/storage/collection/.knowte-revision.json'),
            Times.once(),
        );
        const token = JSON.parse(writtenContent);
        expect(token.version).toBe(1);
        expect(typeof token.revision).toBe('string');
        expect(token.revision.length).toBeGreaterThan(0);
    });

    it('generates a different revision on every call', async () => {
        const files = Mock.ofType<FileAccess>();
        files.setup((x) => x.combinePath(It.isAny(), It.isAny())).returns((parent: string, child: string) => `${parent}/${child}`);
        const written: string[] = [];
        files.setup((x) => x.writeTextToFileAsync(It.isAnyString(), It.isAnyString()))
            .returns(async (_path: string, content: string) => {
                written.push(content);
            });

        await markCollectionChangedAsync(files.object, '/storage/collection');
        await markCollectionChangedAsync(files.object, '/storage/collection');

        expect(JSON.parse(written[0]).revision).not.toEqual(JSON.parse(written[1]).revision);
    });
});
