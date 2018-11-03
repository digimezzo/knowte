import log from 'electron-log';
import * as fs from 'fs';
import { app } from 'electron';
import * as path from 'path';
import { Constants } from '../core/constants';

export class DatabaseMigrator {
    constructor() {
    }

    public initializeDatabase(): void {
        log.info("Initializing database");

        let databaseFileFullPath: string = path.join(app.getPath("appData"), Constants.databaseFile);

        if (!fs.existsSync(databaseFileFullPath)) {
            log.info("Database does not exist. Creating new database.");
            this.createDatabase();
        }
    }

    private createDatabase(): void {

    }
}