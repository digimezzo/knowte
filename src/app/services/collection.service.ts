import { Injectable } from '@angular/core';
import { DataStore } from '../data/dataStore';
import { Constants } from '../core/constants';
import * as path from 'path';
import * as fs from 'fs-extra';
import log from 'electron-log';
import * as Store from 'electron-store';
import { Subject } from 'rxjs';
import { CollectionOperation } from './collectionOperation';
import { Collection } from '../data/collection';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor(private dataStore: DataStore) {
   
  }

  private settings: Store = new Store();

  private storageDirectoryChanged = new Subject<boolean>();
  storageDirectoryChanged$ = this.storageDirectoryChanged.asObservable();

  private collectionsChanged = new Subject();
  collectionsChanged$ = this.collectionsChanged.asObservable();

  private collectionActivated = new Subject<string>();
  collectionActivated$ = this.collectionActivated.asObservable();

  private collectionAdded = new Subject<string>();
  collectionAdded$ = this.collectionAdded.asObservable();

  private collectionRenamed = new Subject<string>();
  collectionRenamed$ = this.collectionRenamed.asObservable();

  private collectionDeleted = new Subject<string>();
  collectionDeleted$ = this.collectionDeleted.asObservable();

  public hasStorageDirectory(): boolean {
    // 1. Get the storage directory from the data store
    let storageDirectory: string = this.settings.get('storageDirectory');

    if (!storageDirectory) {
      // Storage directory is empty
      log.info("Storage directory setting is empty");
      return false;
    }

    // 2. If a storage directory was found in the data store, check if it exists on disk.
    if (!fs.existsSync(storageDirectory)) {
      // Storage directory is not found on disk
      log.info(`Storage directory '${storageDirectory}' is not found on disk`);
      return false;
    }

    // Storage directory is OK.
    log.info(`Storage directory '${storageDirectory}' is OK`);
    return true;
  }

  public async initializeStorageDirectoryAsync(parentDirectory: string): Promise<boolean> {
    try {
      // Generate storage directory path based on parent directory
      let storageDirectory: string = path.join(parentDirectory, Constants.collectionsDirectory);

      // Create storage directory if it doesn't exist
      if (!await fs.exists(storageDirectory)) {
        await fs.mkdir(storageDirectory);
        log.info(`Created storageDirectory '${storageDirectory}' on disk`);
      } else {
        log.info(`StorageDirectory '${storageDirectory}' already exists on disk. No need to create it.`);
      }

      // Save storage directory in the settings store
      this.settings.set('storageDirectory', storageDirectory);
      log.info(`Saved storage directory '${storageDirectory}' in settings store`);

      // Initialize the data store
      this.dataStore.initialize();
    } catch (error) {
      log.error(`Could not create storage directory on disk. Cause: ${error}`);

      return false;
    }

    this.storageDirectoryChanged.next(true);

    return true;
  }

  private collectionExists(collectionName: string): boolean {
    let collection: Collection = this.dataStore.getCollectionByName(collectionName);

    return collection != null;
  }

  public addCollection(collectionName: string): CollectionOperation {
    // Check if a collection name was provided
    if (!collectionName) {
      log.error("addCollectionAsync: name is null");
      return CollectionOperation.Error;
    }

    // Check if there is already a collection with that name
    if (this.collectionExists(collectionName)) {
      log.info(`Not adding collection '${collectionName}' to the data store because it already exists`);
      return CollectionOperation.Duplicate;
    }

    try {
      // Add the collection to the data store
      this.dataStore.addCollection(collectionName, false);
      log.info(`Added collection '${collectionName}' to the data store`);
    } catch (error) {
      log.error(`Could not add collection '${collectionName}'. Cause: ${error}`);

      return CollectionOperation.Error;
    }

    this.collectionAdded.next(collectionName);

    return CollectionOperation.Success;
  }

  public async renameCollectionAsync(collectionId: string, newCollectionName: string): Promise<CollectionOperation> {
    // TODO

    this.collectionRenamed.next(newCollectionName);

    return CollectionOperation.Success;
  }

  public getCollections(): Collection[] {
    let collections: Collection[];

    try {
      collections = this.dataStore.getAllCollections();
    } catch (error) {
      log.error(`Could not get collections. Cause: ${error}`);
      // This is a fatal error. Throw the error so the global error handler catches it.
      throw error;
    }

    return collections;
  }

  public getCollectionName(collectionId: string): string {
    // TODO
    return "";
  }

  public activateCollection(collectionId: string): void {
    // TODO
  }

  public async deleteCollectionAsync(collectionId: string): Promise<CollectionOperation> {
    if (!collectionId) {
      log.error("deleteCollectionAsync: collectionId is null");
      return CollectionOperation.Error;
    }

    let collectionName: string = ""; 

    // TODO

    this.collectionDeleted.next(collectionName);

    return CollectionOperation.Success;
  }
}