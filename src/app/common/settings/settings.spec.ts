import { Settings } from './settings';

const storedSettings = new Map<string, unknown>();

jest.mock('electron-store', () => {
    return class {
        public has(key: string): boolean {
            return storedSettings.has(key);
        }
        public get(key: string): unknown {
            return storedSettings.get(key);
        }
        public set(key: string, value: unknown): void {
            storedSettings.set(key, value);
        }
    };
});

describe('Settings skipTrashForEmptyNotes', () => {
    beforeEach(() => storedSettings.clear());

    it('defaults to true', () => {
        expect(new Settings().skipTrashForEmptyNotes).toBe(true);
    });

    it('adds the default to existing settings', () => {
        storedSettings.set('moveDeletedNotesToTrash', true);

        expect(new Settings().skipTrashForEmptyNotes).toBe(true);
    });

    it('preserves a saved false value', () => {
        storedSettings.set('skipTrashForEmptyNotes', false);

        expect(new Settings().skipTrashForEmptyNotes).toBe(false);
    });

    it('persists changes across settings instances', () => {
        const settings = new Settings();
        settings.skipTrashForEmptyNotes = false;

        expect(new Settings().skipTrashForEmptyNotes).toBe(false);
    });
});
