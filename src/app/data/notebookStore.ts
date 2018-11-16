import * as path from 'path';
import { app } from 'electron';
import * as Datastore from 'nedb';

export class NotebookStore {
    constructor() {
    }

    public databaseFile: string = path.join(app.getPath("userData"), "Notebooks.db");
    private db = new Datastore({ filename: this.databaseFile, autoload: true });
}