import { Injectable } from '@angular/core';
import * as Store from 'electron-store';
import * as loki from 'lokijs';
import * as path from 'path';
import { Constants } from '../core/constants';
import { Collection } from './collection';
import * as nanoid from 'nanoid';

@Injectable({
    providedIn: 'root',
})
export class DataStore {
    private settings: Store = new Store();

    constructor() {
        this.initialize();
    }

    private db: loki;
    private collections: any;
    private notebooks: any;
    private notes: any;

    public initialize(): void {
        let storageDirectory: string = this.settings.get('storageDirectory');

        if (!storageDirectory) {
            return;
        }

        this.db = new loki(path.join(storageDirectory, Constants.dataStoreFile), {autoload: true});

        let mustSaveDatabase: boolean = false;

        this.collections = this.db.getCollection('collections');

        if (!this.collections) {
            this.collections = this.db.addCollection('collections');
            this.collections.insert(new Collection(Constants.defaultCollectionName, nanoid(), true));
            mustSaveDatabase = true;
        }

        this.notebooks = this.db.getCollection('notebooks');

        if (!this.notebooks) {
            this.notebooks = this.db.addCollection('notebooks');
            mustSaveDatabase = true;
        }

        this.notes = this.db.getCollection('notes');

        if (!this.notes) {
            this.notes = this.db.addCollection('notes');
            mustSaveDatabase = true;
        }

        if (mustSaveDatabase) {
            this.db.saveDatabase();
        }
    }

    public getAllCollections(): Collection[] {
        return this.collections.chain().simplesort("name").data();
    }

    public getCollectionByName(collectionName: string): Collection {
        return this.collections.findOne({ 'name': collectionName });
    }

    public addCollection(collectionName: string, isActive: boolean) {
        this.collections.insert(new Collection(collectionName, nanoid(), isActive));
        this.db.saveDatabase();
    }
}
