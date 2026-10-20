import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { SettingsStore } from './settings-store';

describe('SettingsStore', () => {
    let userDataDirectory: string;

    beforeEach(() => {
        userDataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'knowte-settings-'));
    });

    afterEach(() => {
        fs.removeSync(userDataDirectory);
    });

    it('persists settings in config.json and reopens them', () => {
        const settings = new SettingsStore(userDataDirectory);
        settings.set('theme', 'Knowte Dark');

        const reopened = new SettingsStore(userDataDirectory);
        expect(reopened.get('theme')).toBe('Knowte Dark');
        expect(fs.existsSync(path.join(userDataDirectory, 'config.json'))).toBe(true);
    });

    it('preserves changes written by another settings instance', () => {
        const first = new SettingsStore(userDataDirectory);
        const second = new SettingsStore(userDataDirectory);

        first.set('theme', 'Knowte Dark');
        second.set('fontSize', 14);

        const reopened = new SettingsStore(userDataDirectory);
        expect(reopened.get('theme')).toBe('Knowte Dark');
        expect(reopened.get('fontSize')).toBe(14);
    });

    it('reports invalid settings files instead of silently replacing them', () => {
        fs.writeFileSync(path.join(userDataDirectory, 'config.json'), '{invalid json', 'utf-8');

        expect(() => new SettingsStore(userDataDirectory)).toThrow();
    });
});
