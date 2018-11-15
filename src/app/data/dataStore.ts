import { Injectable } from '@angular/core';
import log from 'electron-log';
import * as fs from 'fs-extra';
import { remote } from 'electron';
import * as path from 'path';
import { Constants } from '../core/constants';
import * as lowdb from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileSync';
import { Collection } from './collection';

@Injectable({
    providedIn: 'root',
})
export class DataStore {
    private app = remote.app;
    private db;

    constructor() {
        this.ensureDataStore();
    }

    public dataStorePath: string = path.join(this.app.getPath("userData"), Constants.databaseFile);

    private ensureDataStore(): void {
        let isNewDataStore: boolean = false;

        isNewDataStore = !fs.existsSync(this.dataStorePath);

        // This loads the data store (the data store file is created if it doesn't yet exist)
        let adapter: FileAsync = new FileAsync(this.dataStorePath);
        this.db = lowdb(adapter);
        log.info(`Loaded data store '${this.dataStorePath}'`);

        // If this is a new data store file, we need to add some defaults.
        if (isNewDataStore) {
            this.db.defaults({ storageDirectory: "", collections: [], notebooks: [], notes: [] }).write();
            log.info("Added defaults to data store");
        }
    }

    private deleteDataStore(): void {
        if (fs.existsSync(this.dataStorePath)) {
            fs.unlinkSync(this.dataStorePath);
            log.info(`Deleted database file '${this.dataStorePath}'`);
        }
    }

    public clearDataStore(): void {
        this.db.get('collections').remove().write();
        this.db.get('notebooks').remove().write();
        this.db.get('notes').remove().write();
    }

    public getStorageDirectory(): string {
        return this.db.get('storageDirectory').value();
    }

    public setStorageDirectory(storageDirectory: string): void {
        this.db.set('storageDirectory', storageDirectory).write();
    }

    public addCollection(collectionName: string, isActive: number): void {
        let newCollection: Collection = new Collection(collectionName, isActive);
        this.db.get('collections').push(newCollection).write();
    }

    public getAllCollections(): Collection[] {
        return this.db.get('collections').value();
    }

    public getCollectionsByName(collectionName: string): Collection[] {
        let nameLower: string = collectionName.toLowerCase();

        return this.db.get('collections').filter({ nameLower: nameLower }).value();
    }

    public getCollection(collectionId: string): Collection {
        return this.db.get('collections').find({ id: collectionId }).value();
    }

    public activateCollection(collectionId: string): string {
        this.db.get('collections').each(coll => coll.isActive = 0).write();
        let collectionRef: any = this.db.get('collections').find({ id: collectionId });
        collectionRef.assign({ isActive: 1 }).write();

        return collectionRef.value().name;
    }

    public setCollectionName(collectionId: string, collectionName: string) {
        this.db.get('collections').find({ id: collectionId }).assign({ name: collectionName }).write();
    }

    public deleteCollection(collectionId: string) {
        this.db.get('collections').remove({ id: collectionId }).write();
        this.db.get('notebooks').remove({ collectionId: collectionId }).write();
        this.db.get('notes').remove({ collectionId: collectionId }).write();
    }
}
