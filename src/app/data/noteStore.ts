import { Injectable } from '@angular/core';
import log from 'electron-log';
import * as fs from 'fs';
import { remote } from 'electron';
import * as path from 'path';
import { Constants } from '../core/constants';
import * as low from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';

@Injectable({
    providedIn: 'root',
})
export class NoteStore {
    constructor() {
        this.loadOrCreateDatabase();
    }

    private app = remote.app;
    private databaseFileFullPath: string;
    private db;

    private deleteDatabase(): void {
        if (fs.existsSync(this.databaseFileFullPath)) {
            log.info(`Database already exist at '${this.databaseFileFullPath}'. Deleting.`);

            fs.unlinkSync(this.databaseFileFullPath);
            log.info(`Database file at '${this.databaseFileFullPath}' deleted`);
        }
    }

    private loadOrCreateDatabase(): void {
        this.databaseFileFullPath = path.join(this.app.getPath("userData"), Constants.databaseFile);
        let adapter: FileSync = new FileSync(this.databaseFileFullPath);
        this.db = low(adapter);

        log.info(`Loaded database '${this.databaseFileFullPath}'`);
    }

    public resetDatabase(): void {
        log.info("Resetting database");

        // 1. Delete the existing database
        this.deleteDatabase();

        // 2. Create a new database
        this.loadOrCreateDatabase();
    }

    public addCollection(collectionName: string) {
        // TODO
    }
}
