import { Injectable } from '@angular/core';
import * as Store from 'electron-store';
import * as loki from 'lokijs';
import * as path from 'path';
import { Constants } from '../core/constants';
import { Collection } from './collection';
import * as nanoid from 'nanoid';
import { Subject } from 'rxjs';
import { Notebook } from './notebook';
import { Note } from './note';

@Injectable({
    providedIn: 'root',
})
export class DataStore {
    private settings: Store = new Store();

    constructor() {
    }

    private db: loki;
    private collections: any;
    private notebooks: any;
    private notes: any;

    public isReady: boolean = false;

    private databaseLoaded(): void {
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

        this.isReady = true;
    }

    public initialize(): void {
        let storageDirectory: string = this.settings.get('storageDirectory');

        if (!storageDirectory) {
            return;
        }

        this.db = new loki(path.join(storageDirectory, Constants.dataStoreFile), {
            autoload: true,
            autoloadCallback: this.databaseLoaded.bind(this)
        });
    }

    public getAllCollections(): Collection[] {
        return this.collections.chain().simplesort("name").data();
    }

    public getCollection(collectionId: string): Collection {
        return this.collections.findOne({ 'id': collectionId });
    }

    public getCollectionByName(collectionName: string): Collection {
        return this.collections.findOne({ 'name': collectionName });
    }

    public addCollection(collectionName: string, isActive: boolean) {
        this.collections.insert(new Collection(collectionName, nanoid(), isActive));
        this.db.saveDatabase();
    }

    public setCollectionName(collectionId: string, collectionName: string) {
        let collectionToRename: Collection = this.collections.findOne({ 'id': collectionId });
        collectionToRename.name = collectionName;
        this.collections.update(collectionToRename);
        this.db.saveDatabase();
    }

    public activateCollection(collectionId: string): void {
        // Deactivate all collections
        let collections: Collection[] = this.collections.find();

        collections.forEach(x => {
            x.isActive = false;
            this.collections.update(x);
        });

        // Activate the selected collection
        let collectionToActivate: Collection = this.collections.findOne({ 'id': collectionId });
        collectionToActivate.isActive = true;
        this.collections.update(collectionToActivate);

        // Persist
        this.db.saveDatabase();
    }

    public deleteCollection(collectionId: string) {
        // Remove collection
        let collectionToRemove: Collection = this.collections.findOne({ 'id': collectionId });
        this.collections.remove(collectionToRemove);

        // Remove Notebooks
        let notebooksToRemove: Notebook[] = this.notebooks.find({ 'collectionId': collectionId });
        notebooksToRemove.forEach(x => this.notebooks.remove(x));

        // Remove Notes
        let notesToRemove: Note[] = this.notes.find({ 'collectionId': collectionId });
        notesToRemove.forEach(x => this.notes.remove(x));

        // Persist
        this.db.saveDatabase();
    }

    public getActiveCollection(): Collection {
        let activeCollection: Collection = this.collections.findOne({ 'isActive': true });

        return activeCollection;
    }
}
