import { It, Mock, Times } from 'typemoq';
import { FileAccess } from '../../common/io/file-access';
import { Logger } from '../../common/logging/logger';
import { DataStore } from '../../data/data-store';
import { DataStoreFactory } from '../../data/data-store-factory';
import { Notebook } from '../../data/entities/notebook';
import { CollectionDataStoreAccess } from './collection-data-store.access';
import { CollectionPathConverter } from './collection-path-converter';

jest.mock('nanoid', () => ({ nanoid: () => 'entity-id' }));

describe('CollectionDataStoreAccess', () => {
    it('initializes the injected store with the collection database path', async () => {
        const dataStore = Mock.ofType<DataStore>();
        const paths = Mock.ofType<CollectionPathConverter>();
        const files = Mock.ofType<FileAccess>();
        const logger = Mock.ofType<Logger>();
        const initialize = jest.fn().mockResolvedValue(undefined);
        paths.setup((x) => x.getCollectionDirectoryPathFromCollectionName('Work')).returns(() => '/collections/Work');
        files.setup((x) => x.combinePath('/collections/Work', 'Work.db')).returns(() => '/collections/Work/Work.db');
        dataStore.setup((x) => x.initializeAsync(It.isAnyString())).returns(initialize);
        const access = new CollectionDataStoreAccess(paths.object, files.object, dataStore.object, logger.object,
            Mock.ofType<DataStoreFactory>().object);

        await access.initializeAsync('Work');

        expect(initialize).toHaveBeenCalledWith('/collections/Work/Work.db');
    });

    it('delegates reads and writes to an injected mock without opening Loki', () => {
        const dataStore = Mock.ofType<DataStore>();
        const notebook = new Notebook('Work');
        const update = jest.fn();
        dataStore.setup((x) => x.getNotebooks()).returns(() => [notebook]);
        dataStore.setup((x) => x.updateNotebook(notebook, It.isAny())).callback(update);
        const access = new CollectionDataStoreAccess(
            Mock.ofType<CollectionPathConverter>().object,
            Mock.ofType<FileAccess>().object,
            dataStore.object,
            Mock.ofType<Logger>().object,
            Mock.ofType<DataStoreFactory>().object
        );

        expect(access.getNotebooks()).toEqual([notebook]);
        access.updateNotebook(notebook);
        expect(update).toHaveBeenCalledWith(notebook, true);
        access.updateNotebook(notebook, false);
        expect(update).toHaveBeenLastCalledWith(notebook, false);
    });

    it('opens a destination through the factory without replacing the active store', async () => {
        const source = Mock.ofType<DataStore>();
        const destination = Mock.ofType<DataStore>();
        destination.setup((x) => x['then']).returns(() => undefined);
        const factory = Mock.ofType<DataStoreFactory>();
        const paths = Mock.ofType<CollectionPathConverter>();
        const files = Mock.ofType<FileAccess>();
        const notebook = new Notebook('Source');
        const copied = new Notebook('Destination');
        source.setup((x) => x.getNotebooks()).returns(() => [notebook]);
        destination.setup((x) => x.getNotebooks()).returns(() => [copied]);
        paths.setup((x) => x.getCollectionDirectoryPathFromCollectionName('Destination')).returns(() => '/Destination');
        files.setup((x) => x.combinePath('/Destination', 'Destination.db')).returns(() => '/Destination/Destination.db');
        let ready: (store: DataStore) => void;
        factory.setup((x) => x.openAsync('/Destination/Destination.db')).returns(() =>
            new Promise<DataStore>((resolve) => (ready = resolve)));
        const access = new CollectionDataStoreAccess(paths.object, files.object, source.object,
            Mock.ofType<Logger>().object, factory.object);

        const opening = access.openCollectionAsync('Destination');
        expect(access.getNotebooks()).toEqual([notebook]);
        ready(destination.object);
        const opened = await opening;
        expect(opened.getNotebooks()).toEqual([copied]);
        expect(access.getNotebooks()).toEqual([notebook]);
    });

    it('marks the collection as changed before saving the database, when a mutation is pending', async () => {
        const dataStore = Mock.ofType<DataStore>();
        const paths = Mock.ofType<CollectionPathConverter>();
        const files = Mock.ofType<FileAccess>();
        const logger = Mock.ofType<Logger>();
        const calls: string[] = [];
        dataStore.setup((x) => x.initializeAsync(It.isAnyString())).returns(() => Promise.resolve());
        dataStore.setup((x) => x.updateNotebook(It.isAny(), It.isAny())).returns(() => undefined);
        dataStore.setup((x) => x.saveAsync()).returns(() => {
            calls.push('saveAsync');
            return Promise.resolve();
        });
        paths.setup((x) => x.getCollectionDirectoryPathFromCollectionName('Work')).returns(() => '/collections/Work');
        files.setup((x) => x.combinePath('/collections/Work', 'Work.db')).returns(() => '/collections/Work/Work.db');
        files.setup((x) => x.combinePath('/collections/Work', '.knowte-revision.json')).returns(() => '/collections/Work/.knowte-revision.json');
        files.setup((x) => x.writeTextToFileAsync(It.isAnyString(), It.isAnyString())).returns(() => {
            calls.push('writeTextToFileAsync');
            return Promise.resolve();
        });
        files.setup((x) => x.renameFileOrDirectory(It.isAnyString(), It.isAnyString())).returns(() => {
            calls.push('renameFileOrDirectory');
        });
        const access = new CollectionDataStoreAccess(paths.object, files.object, dataStore.object, logger.object,
            Mock.ofType<DataStoreFactory>().object);
        await access.initializeAsync('Work');
        access.updateNotebook(new Notebook('Work'));

        await access.saveAsync();

        expect(calls).toEqual(['writeTextToFileAsync', 'renameFileOrDirectory', 'saveAsync']);
        files.verify(
            (x) => x.renameFileOrDirectory('/collections/Work/.knowte-revision.json.tmp', '/collections/Work/.knowte-revision.json'),
            Times.once(),
        );
    });

    it('does not mark the collection as changed when saving without a pending mutation', async () => {
        // saveAsync() is also used as a plain flush (for example by the backup checkpoint
        // mechanism) when nothing actually changed; marking unconditionally would make the
        // collection look like it keeps changing to the backup's stability check.
        const dataStore = Mock.ofType<DataStore>();
        const paths = Mock.ofType<CollectionPathConverter>();
        const files = Mock.ofType<FileAccess>();
        const logger = Mock.ofType<Logger>();
        dataStore.setup((x) => x.initializeAsync(It.isAnyString())).returns(() => Promise.resolve());
        dataStore.setup((x) => x.saveAsync()).returns(() => Promise.resolve());
        paths.setup((x) => x.getCollectionDirectoryPathFromCollectionName('Work')).returns(() => '/collections/Work');
        files.setup((x) => x.combinePath('/collections/Work', 'Work.db')).returns(() => '/collections/Work/Work.db');
        const access = new CollectionDataStoreAccess(paths.object, files.object, dataStore.object, logger.object,
            Mock.ofType<DataStoreFactory>().object);
        await access.initializeAsync('Work');

        await access.saveAsync();
        await access.saveAsync();

        files.verify((x) => x.writeTextToFileAsync(It.isAnyString(), It.isAnyString()), Times.never());
    });

    it('only marks once for several mutations batched before a single save', async () => {
        const dataStore = Mock.ofType<DataStore>();
        const paths = Mock.ofType<CollectionPathConverter>();
        const files = Mock.ofType<FileAccess>();
        const logger = Mock.ofType<Logger>();
        dataStore.setup((x) => x.initializeAsync(It.isAnyString())).returns(() => Promise.resolve());
        dataStore.setup((x) => x.updateNotebook(It.isAny(), It.isAny())).returns(() => undefined);
        dataStore.setup((x) => x.deleteNote(It.isAnyString())).returns(() => undefined);
        dataStore.setup((x) => x.saveAsync()).returns(() => Promise.resolve());
        paths.setup((x) => x.getCollectionDirectoryPathFromCollectionName('Work')).returns(() => '/collections/Work');
        files.setup((x) => x.combinePath('/collections/Work', 'Work.db')).returns(() => '/collections/Work/Work.db');
        files.setup((x) => x.combinePath('/collections/Work', '.knowte-revision.json')).returns(() => '/collections/Work/.knowte-revision.json');
        files.setup((x) => x.writeTextToFileAsync(It.isAnyString(), It.isAnyString())).returns(() => Promise.resolve());
        files.setup((x) => x.renameFileOrDirectory(It.isAnyString(), It.isAnyString())).returns(() => undefined);
        const access = new CollectionDataStoreAccess(paths.object, files.object, dataStore.object, logger.object,
            Mock.ofType<DataStoreFactory>().object);
        await access.initializeAsync('Work');
        access.updateNotebook(new Notebook('Work'));
        access.deleteNote('note-id');

        await access.saveAsync();
        await access.saveAsync();

        files.verify((x) => x.writeTextToFileAsync(It.isAnyString(), It.isAnyString()), Times.once());
    });

    it('does not attempt to mark a collection as changed before a collection name is known', async () => {
        const dataStore = Mock.ofType<DataStore>();
        const files = Mock.ofType<FileAccess>();
        dataStore.setup((x) => x.saveAsync()).returns(() => Promise.resolve());
        const access = new CollectionDataStoreAccess(
            Mock.ofType<CollectionPathConverter>().object,
            files.object,
            dataStore.object,
            Mock.ofType<Logger>().object,
            Mock.ofType<DataStoreFactory>().object,
        );

        await access.saveAsync();

        files.verify((x) => x.writeTextToFileAsync(It.isAnyString(), It.isAnyString()), Times.never());
    });
});
