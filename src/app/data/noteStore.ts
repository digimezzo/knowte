import { Injectable } from '@angular/core';
import log from 'electron-log';
import * as fs from 'fs';
import { app } from 'electron';
import * as path from 'path';
import { Constants } from '../core/constants';
import Datastore from 'nedb';

@Injectable({
    providedIn: 'root',
})
export class NoteStore {
    constructor() {
        this.loadOrCreateDatabase();
    }

    private databaseFileFullPath: string = path.join(app.getPath("appData"), Constants.databaseFile);
    private db: Datastore;

    private deleteDatabase(): void {
        if (fs.existsSync(this.databaseFileFullPath)) {
            log.info(`Database already exist at '${this.databaseFileFullPath}'. Deleting.`);

            fs.unlink(this.databaseFileFullPath, (error) => {
                if (error) {
                    log.error(`Could not delete the database file at '${this.databaseFileFullPath}'. Cause: ${error.message}`);
                }

                log.info(`Database file at '${this.databaseFileFullPath}' succesfully deleted`);
            });
        }
    }

    private loadOrCreateDatabase(): void {
        this.db = new Datastore({ filename: this.databaseFileFullPath, autoload: true });
    }

    public resetDatabase(): void {
        log.info("Resetting database");

        // 1. Delete the existing database
        this.deleteDatabase();

        // 2. Create a new database
        this.loadOrCreateDatabase();
    }
}
