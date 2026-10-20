import * as fs from 'fs-extra';
import * as path from 'path';

export class SettingsStore {
    private data: Record<string, unknown>;
    private readonly settingsFile: string;

    public constructor(userDataDirectory: string) {
        this.settingsFile = path.join(userDataDirectory, 'config.json');
        this.data = this.read();
    }

    public has(key: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.data, key);
    }

    public get<T>(key: string, fallback?: T): T {
        return (this.has(key) ? this.data[key] : fallback) as T;
    }

    public set<T>(key: string, value: T): void {
        this.data = this.read();
        this.data[key] = value;
        this.save();
    }

    private read(): Record<string, unknown> {
        if (!fs.existsSync(this.settingsFile)) {
            return {};
        }

        const content = fs.readFileSync(this.settingsFile, 'utf-8');
        if (content.trim().length === 0) {
            return {};
        }

        const parsed: unknown = JSON.parse(content);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            throw new Error(`Invalid settings format in ${this.settingsFile}`);
        }

        return parsed as Record<string, unknown>;
    }

    private save(): void {
        fs.ensureDirSync(path.dirname(this.settingsFile));
        const temporaryFile = `${this.settingsFile}.${process.pid}.${Date.now()}.tmp`;
        fs.writeFileSync(temporaryFile, JSON.stringify(this.data, null, 2), 'utf-8');
        fs.renameSync(temporaryFile, this.settingsFile);
    }
}
