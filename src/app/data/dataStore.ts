import { Injectable } from '@angular/core';
import log from 'electron-log';
import * as fs from 'fs';
import { remote } from 'electron';
import * as path from 'path';
import { Constants } from '../core/constants';
import * as low from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import { Collection } from './collection';

@Injectable({
    providedIn: 'root',
})
export class DataStore {
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

        // Add defaults
        this.db.defaults({ collections: [], notebooks: [], notes: [] }).write();

        log.info(`Loaded database '${this.databaseFileFullPath}'`);
    }

    public resetDatabase(): void {
        log.info("Resetting database");

        // 1. Delete the existing database
        this.deleteDatabase();

        // 2. Create a new database
        this.loadOrCreateDatabase();
    }

    public addCollection(name: string, isActive: boolean) {
        let newCollection: Collection = new Collection(name, isActive);
        this.db.get('collections').push(newCollection).write();
    }

    public getCollections(): Collection[] {
        return this.db.get('collections').value();
    }
}
