import { clipboard } from 'electron';
import { ClipboardManager } from './clipboard-manager';

jest.mock('electron', () => ({
    clipboard: { readText: jest.fn(), readImage: jest.fn() },
    nativeImage: { createFromPath: jest.fn() },
}));

describe('ClipboardManager', () => {
    it('copies only the JPEG bytes from a clipboard image into the blob', async () => {
        const bytes = Buffer.from([9, 1, 2, 3, 9]).subarray(1, 4);
        const toJPEG = jest.fn().mockReturnValue(bytes);
        (clipboard.readText as jest.Mock).mockReturnValue('');
        (clipboard.readImage as jest.Mock).mockReturnValue({ toJPEG });

        const blob = new ClipboardManager().readImage();
        const data = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(blob);
        });

        expect(toJPEG).toHaveBeenCalledWith(80);
        expect(blob.type).toBe('image/jpeg');
        expect(Array.from(new Uint8Array(data))).toEqual([1, 2, 3]);
    });
});
