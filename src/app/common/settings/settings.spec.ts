import { Settings } from './settings';

const storedSettings = new Map<string, unknown>();

jest.mock('electron-store', () => {
    return class {
        public has(key: string): boolean {
            return storedSettings.has(key);
        }
        public get(key: string, defaultValue?: unknown): unknown {
            return storedSettings.has(key) ? storedSettings.get(key) : defaultValue;
        }
        public set(key: string, value: unknown): void {
            storedSettings.set(key, value);
        }
    };
});

describe('Settings skipTrashForEmptyNotes', () => {
    beforeEach(() => storedSettings.clear());

    it('leaves backups opt-in with hourly scheduling and five retained backups', () => {
        const settings = new Settings();
        expect(settings.backupEnabled).toBe(false);
        expect(settings.backupDirectory).toBe('');
        expect(settings.backupIntervalMinutes).toBe(60);
        expect(settings.backupRetentionCount).toBe(5);
        expect(settings.backupLastSuccess).toBe('');
        expect(settings.backupLastError).toBe('');
    });

    it('persists backup configuration and status', () => {
        const settings = new Settings();
        settings.backupEnabled = true;
        settings.backupDirectory = '/cloud/backups';
        settings.backupIntervalMinutes = 120;
        settings.backupRetentionCount = 10;
        settings.backupLastSuccess = '2026-10-17T12:00:00Z';
        settings.backupLastError = 'Destination is offline';
        const reopened = new Settings();
        expect(reopened.backupEnabled).toBe(true);
        expect(reopened.backupDirectory).toBe('/cloud/backups');
        expect(reopened.backupIntervalMinutes).toBe(120);
        expect(reopened.backupRetentionCount).toBe(10);
        expect(reopened.backupLastSuccess).toBe('2026-10-17T12:00:00Z');
        expect(reopened.backupLastError).toBe('Destination is offline');
    });

    it('defaults to true', () => {
        expect(new Settings().skipTrashForEmptyNotes).toBe(true);
    });

    describe('Settings showArchivedNotebooks', () => {
        beforeEach(() => storedSettings.clear());

        it('hides archived notebooks by default, including with existing settings', () => {
            storedSettings.set('language', 'en');
            expect(new Settings().showArchivedNotebooks).toBe(false);
        });

        it('remembers visibility across settings instances', () => {
            const settings = new Settings();
            settings.showArchivedNotebooks = true;
            expect(new Settings().showArchivedNotebooks).toBe(true);
            settings.showArchivedNotebooks = false;
            expect(new Settings().showArchivedNotebooks).toBe(false);
        });
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
