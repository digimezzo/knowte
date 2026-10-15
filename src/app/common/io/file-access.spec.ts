import * as fs from 'fs-extra';
import * as path from 'path';
import { Mock } from 'typemoq';
import { Desktop } from './desktop';
import { FileAccess } from './file-access';

jest.mock('@electron/remote', () => ({}));
jest.mock('fs-extra', () => ({
    stat: jest.fn(),
    lstat: jest.fn(),
    readdir: jest.fn(),
    unlink: jest.fn(),
    mkdir: jest.fn(),
    remove: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    existsSync: jest.fn(() => { throw new Error('Blocking disk access'); }),
    lstatSync: jest.fn(() => { throw new Error('Blocking disk access'); }),
}));

describe('FileAccess asynchronous disk operations', () => {
    let files: FileAccess;

    beforeEach(() => {
        jest.clearAllMocks();
        files = new FileAccess(Mock.ofType<Desktop>().object);
    });

    it('yields to the event loop while waiting for slow file metadata', async () => {
        let finishStat: (value: { isFile: () => boolean }) => void;
        (fs.readdir as jest.Mock).mockResolvedValue(['note.png']);
        (fs.lstat as jest.Mock).mockImplementation(() => new Promise((resolve) => { finishStat = resolve; }));
        let completed = false;
        const result = files.getFilesInDirectoryAsync('/storage').then((paths) => {
            completed = true;
            return paths;
        });

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(completed).toBe(false);
        finishStat({ isFile: () => true });
        expect(await result).toEqual([`/storage${path.sep}note.png`]);
        expect(fs.lstatSync).not.toHaveBeenCalled();
    });

    it('filters directories and retains continue-on-error behavior', async () => {
        const error = new Error('Cannot inspect attachment');
        (fs.readdir as jest.Mock).mockResolvedValue(['folder', 'broken', 'image.png']);
        (fs.lstat as jest.Mock)
            .mockResolvedValueOnce({ isFile: () => false })
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce({ isFile: () => true });
        const errors: Error[] = [];

        expect(await files.getFilesInDirectoryAsync('/storage', true, errors)).toEqual([`/storage${path.sep}image.png`]);
        expect(errors).toEqual([error]);
    });

    it('propagates metadata errors by default', async () => {
        const error = new Error('Cannot inspect attachment');
        (fs.readdir as jest.Mock).mockResolvedValue(['broken']);
        (fs.lstat as jest.Mock).mockRejectedValue(error);

        await expect(files.getFilesInDirectoryAsync('/storage')).rejects.toBe(error);
    });

    it('checks existence asynchronously and only treats missing paths as absent', async () => {
        (fs.stat as jest.Mock).mockResolvedValueOnce({});
        expect(await files.pathExistsAsync('/storage')).toBe(true);
        (fs.stat as jest.Mock).mockRejectedValueOnce({ code: 'ENOENT' });
        expect(await files.pathExistsAsync('/missing')).toBe(false);
        const error = Object.assign(new Error('Access denied'), { code: 'EACCES' });
        (fs.stat as jest.Mock).mockRejectedValueOnce(error);
        await expect(files.pathExistsAsync('/private')).rejects.toBe(error);
        expect(fs.existsSync).not.toHaveBeenCalled();
    });

    it('deletes files without a blocking existence check and propagates deletion errors', async () => {
        (fs.unlink as jest.Mock).mockResolvedValueOnce(undefined).mockRejectedValueOnce({ code: 'ENOENT' });
        await files.deleteFileIfExistsAsync('/storage/image.png');
        await files.deleteFileIfExistsAsync('/missing');
        const error = new Error('Cannot delete');
        (fs.unlink as jest.Mock).mockRejectedValueOnce(error);
        await expect(files.deleteFileIfExistsAsync('/locked')).rejects.toBe(error);
        expect(fs.existsSync).not.toHaveBeenCalled();
    });

    it('awaits recursive directory creation and deletion', async () => {
        (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
        (fs.remove as jest.Mock).mockResolvedValue(undefined);

        await files.createFullDirectoryPathIfDoesNotExistAsync('/preview/note');
        await files.deleteDirectoryRecursivelyAsync('/preview/note');

        expect(fs.mkdir).toHaveBeenCalledWith('/preview/note', { recursive: true });
        expect(fs.remove).toHaveBeenCalledWith('/preview/note');
    });
});
