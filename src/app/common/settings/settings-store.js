"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsStore = void 0;
const fs = require("fs-extra");
const path = require("path");
class SettingsStore {
    constructor(userDataDirectory) {
        this.settingsFile = path.join(userDataDirectory, 'config.json');
        this.data = this.read();
    }
    has(key) {
        return Object.prototype.hasOwnProperty.call(this.data, key);
    }
    get(key, fallback) {
        return (this.has(key) ? this.data[key] : fallback);
    }
    set(key, value) {
        this.data = this.read();
        this.data[key] = value;
        this.save();
    }
    read() {
        if (!fs.existsSync(this.settingsFile)) {
            return {};
        }
        const content = fs.readFileSync(this.settingsFile, 'utf-8');
        if (content.trim().length === 0) {
            return {};
        }
        const parsed = JSON.parse(content);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            throw new Error(`Invalid settings format in ${this.settingsFile}`);
        }
        return parsed;
    }
    save() {
        fs.ensureDirSync(path.dirname(this.settingsFile));
        const temporaryFile = `${this.settingsFile}.${process.pid}.${Date.now()}.tmp`;
        fs.writeFileSync(temporaryFile, JSON.stringify(this.data, null, 2), 'utf-8');
        fs.renameSync(temporaryFile, this.settingsFile);
    }
}
exports.SettingsStore = SettingsStore;
//# sourceMappingURL=settings-store.js.map