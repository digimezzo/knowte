import * as path from 'path';
import { app } from 'electron';
import * as Datastore from 'nedb';

export class NoteStore {
    constructor() {
    }

    public databaseFile: string = path.join(app.getPath("userData"), "Notes.db");
    private db = new Datastore({ filename: this.databaseFile, autoload: true });
}