import * as path from 'path';
import { app } from 'electron';
import * as Datastore from 'nedb';

export class CollectionStore {
    constructor() {
    }

    public databaseFile: string = path.join(app.getPath("userData"), "Collections.db");
    private db = new Datastore({ filename: this.databaseFile, autoload: true });
}