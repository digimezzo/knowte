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
import { Utils } from '../core/utils';
import { Notebook } from '../data/notebook';
import { Note } from '../data/note';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor(private dataStore: DataStore, private translateService: TranslateService) {

  }

  private settings: Store = new Store();

  private dataStoreInitialized = new Subject<boolean>();
  dataStoreInitialized$ = this.dataStoreInitialized.asObservable();

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

  public get hasStorageDirectory(): boolean {
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
    } catch (error) {
      log.error(`Could not create storage directory on disk. Cause: ${error}`);

      return false;
    }

    //await Utils.sleep(2000);

    return true;
  }

  public async initializeDataStoreAsync(): Promise<void> {
    this.dataStore.initialize();

    while (!this.dataStore.isReady) {
      await Utils.sleep(100);
    }

    //await Utils.sleep(2000);
    this.dataStoreInitialized.next();
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
    if (!collectionId || !newCollectionName) {
      log.error("renameCollectionAsync: collectionId or newCollectionName is null");
      return CollectionOperation.Error;
    }

    try {
      // 1. Check if there is already a collection with that name
      if (this.collectionExists(newCollectionName)) {
        return CollectionOperation.Duplicate;
      }

      // 2. Rename the collection
      this.dataStore.setCollectionName(collectionId, newCollectionName);
    } catch (error) {
      log.error(`Could not rename the collection with id='${collectionId}' to '${newCollectionName}'. Cause: ${error}`);
      return CollectionOperation.Error;
    }

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
    return this.dataStore.getCollection(collectionId).name;
  }

  public activateCollection(collectionId: string): void {
    this.dataStore.activateCollection(collectionId);
  }

  public async deleteCollectionAsync(collectionId: string): Promise<CollectionOperation> {
    if (!collectionId) {
      log.error("deleteCollectionAsync: collectionId is null");
      return CollectionOperation.Error;
    }

    let collectionName: string = "";

    try {
      // 1. Get the name of the collection
      collectionName = this.getCollectionName(collectionId);

      // 2. Delete collection from data store (including its notebooks and notes)
      this.dataStore.deleteCollection(collectionId);

      // 2. Delete the note files from disk
      // TODO
    } catch (error) {
      log.error(`Could not delete the collection with id='${collectionId}'. Cause: ${error}`);
      return CollectionOperation.Error;
    }

    this.collectionDeleted.next(collectionName);
    return CollectionOperation.Success;
  }

  public getNotebooks(): Notebook[] {
    let notebooks: Notebook[] = [];

    try {
      // 1. Get the active collection. If none is found, return an empty array.
      let activeCollection: Collection = this.dataStore.getActiveCollection();

      if (!activeCollection) {
        return notebooks;
      }

      // 2. Get the id of the active collection
      let activeCollectionId: string = activeCollection.id;

      // 3. Add the default notebooks
      let allNotesNotebook: Notebook = new Notebook(this.translateService.instant('MainPage.AllNotes'), Constants.allNotesNotebookId, activeCollectionId);
      allNotesNotebook.isDefault = true;

      let unfiledNotesNotebook: Notebook = new Notebook(this.translateService.instant('MainPage.UnfiledNotes'), Constants.unfiledNotesNotebookId, activeCollectionId);
      unfiledNotesNotebook.isDefault = true;

      notebooks.push(allNotesNotebook);
      notebooks.push(unfiledNotesNotebook);

      // 4. Add the notebooks for this collection
      // notebooks = this.dataStore.getAllNotebooks(activeCollectionId);
    } catch (error) {
      log.error(`Could not get notebooks. Cause: ${error}`);
    }

    return notebooks;
  }
}