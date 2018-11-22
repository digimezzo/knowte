import { Injectable } from '@angular/core';
import log from 'electron-log';
import { DataStore } from '../data/dataStore';
import * as Store from 'electron-store';
import * as fs from 'fs-extra';
import { Constants } from '../core/constants';
import * as path from 'path';
import { Subject } from 'rxjs';
import { Collection } from '../data/collection';
import { CollectionOperation } from './collectionOperation';
import { Utils } from '../core/utils';
import * as sanitize from 'sanitize-filename';
import { remote } from 'electron';
import { CollectionStore } from '../data/collectionStore';
import { NotebookStore } from '../data/notebookStore';
import { NoteStore } from '../data/noteStore';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor(private dataStore: DataStore, private collectionStore: CollectionStore, private notebookStore: NotebookStore, private noteStore: NoteStore) {
    this.createDefaultCollectionDirectory();
  }

  // private settings: Store = new Store();

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

  private getCollectionDirectories(): string[] {
    let settingsStorageDirectory: string = this.dataStore.getStorageDirectory();
    let fileNames: string[] = fs.readdirSync(settingsStorageDirectory);
    let collectionDirectories: string[] = [];

    for (let fileName of fileNames) {
      let absoluteFilePath: string = path.join(settingsStorageDirectory, fileName);
      let stat: any = fs.statSync(absoluteFilePath);

      if (stat.isDirectory() && fileName.includes(Constants.collectionFoldersSuffix)) {
        collectionDirectories.push(fileName);
      }
    }

    return collectionDirectories;
  }

  private generateCollectionDirectoryPath(collectionName: string): string {
    let settingsStorageDirectory: string = this.dataStore.getStorageDirectory();
    let collectionDirectoryName: string = `${collectionName} ${Constants.collectionFoldersSuffix}`;

    return path.join(settingsStorageDirectory, collectionDirectoryName);
  }

  private createDefaultCollectionDirectory(): void {
    // If no storage directory is found, don't try to create a default collection directory.
    if (!this.hasStorageDirectory()) {
      log.info("Not creating default collection, because there is no storage directory.");
      return;
    }

    let collectionDirectories: string[] = this.getCollectionDirectories();

    // If there are no collections, create a default collection.
    if (collectionDirectories.length == 0) {
      fs.mkdirSync(path.join(this.generateCollectionDirectoryPath(Constants.defaultCollectionName)));
      log.info(`No collections were found. Created new collection '${Constants.defaultCollectionName}'.`);
    }
  }

  public hasStorageDirectory(): boolean {
    // 1. Get the storage directory from the data store
    let storageDirectory: string = this.dataStore.getStorageDirectory();

    if (!storageDirectory) {
      // Storage directory is empty
      log.info("Storage directory is empty");
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

  private collectionDirectory2CollectionName(collectionDirectory: string): string {
    return collectionDirectory.substring(0, collectionDirectory.lastIndexOf(Constants.collectionFoldersSuffix) - 1);
  }

  private collectionName2CollectionDirectory(collectionName: string): string {
    return `${collectionName} ${Constants.collectionFoldersSuffix}`;
  }

  private async importNotesAsync(): Promise<void> {
    // Make sure we start from scratch
    this.dataStore.clearDataStore();

    let collectionDirectories: string[] = this.getCollectionDirectories();
    log.info(`Found ${collectionDirectories.length} collection directories`);

    let isActive: number = 1;

    for (let collectionDirectory of collectionDirectories) {
      this.dataStore.addCollection(this.collectionDirectory2CollectionName(collectionDirectory), isActive);
      isActive = 0; // Only the first collection we find, must be active.
    }

    // TODO: import notes

    this.collectionsChanged.next();
  }

  public async initializeStorageDirectoryAsync(parentDirectory: string): Promise<boolean> {
    try {
      // Generate storage directory path based on parent directory
      let storageDirectory: string = path.join(parentDirectory, Constants.collectionsSubDirectory);

      // Create storage directory if it doesn't exist
      if (!await fs.exists(storageDirectory)) {
        await fs.mkdir(storageDirectory);
        log.info(`Created storageDirectory '${storageDirectory}' on disk`);
      } else {
        log.info(`StorageDirectory '${storageDirectory}' already exists on disk. No need to create it.`);
      }

      // Save storage directory in the data store
      this.dataStore.setStorageDirectory(storageDirectory);
      log.info(`Saved storage directory '${storageDirectory}' in data store`);

      // Create a default collection
      this.createDefaultCollectionDirectory();

      // Import notes, if found.
      await this.importNotesAsync();
    } catch (error) {
      log.error(`Could not create storage directory on disk. Cause: ${error}`);

      return false;
    }

    this.storageDirectoryChanged.next(true);

    return true;
  }

  public async getCollectionsAsync(): Promise<Collection[]> {
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

  private collectionExists(collectionName: string): boolean {
    let collections: Collection[] = this.dataStore.getCollectionsByName(collectionName);

    return collections.length > 0;
  }

  public async addCollectionAsync(collectionName: string): Promise<CollectionOperation> {
    // Check if a collection name was provided
    if (!collectionName) {
      log.error("addCollectionAsync: name is null");
      return CollectionOperation.Error;
    }

    // Sanitize for filename
    let sanitizedCollectionName: string = sanitize(collectionName);
    log.info(`Sanitized proposed collection name '${collectionName}' to '${sanitizedCollectionName}'`);

    if (!sanitizedCollectionName) {
      log.error(`Collection name '${collectionName}' after sanitize is '${sanitizedCollectionName}' and cannot be empty.`);
      return CollectionOperation.Error;
    }

    // Check if there is already a collection with that name
    if (this.collectionExists(collectionName)) {
      return CollectionOperation.Duplicate;
    }

    try {
      // Add the collection to disk
      let settingsStorageDirectory: string = this.dataStore.getStorageDirectory();
      let collectionDirectory: string = this.collectionName2CollectionDirectory(sanitizedCollectionName);
      await fs.mkdir(path.join(settingsStorageDirectory, collectionDirectory));
      log.info(`Added collection '${sanitizedCollectionName}' to disk`);

      // Add the collection to the data store
      this.dataStore.addCollection(sanitizedCollectionName, 0);
      log.info(`Added collection '${sanitizedCollectionName}' to data store`);
    } catch (error) {
      log.error(`Could not add collection '${sanitizedCollectionName}'. Cause: ${error}`);

      return CollectionOperation.Error;
    }

    this.collectionAdded.next(sanitizedCollectionName);

    return CollectionOperation.Success;
  }

  public activateCollection(collectionId: string): void {
    let collectionName: string = this.dataStore.activateCollection(collectionId);
    this.collectionActivated.next(collectionName);
  }

  public getCollectionName(collectionId: string): string {
    return this.dataStore.getCollection(collectionId).name;
  }

  public async renameCollectionAsync(collectionId: string, newCollectionName: string): Promise<CollectionOperation> {
    if (!collectionId || !newCollectionName) {
      log.error("renameCollectionAsync: collectionId or newCollectionName is null");
      return CollectionOperation.Error;
    }

    let sanitizedNewCollectionName: string = sanitize(newCollectionName);
    log.info(`Sanitized proposed collection name '${newCollectionName}' to '${sanitizedNewCollectionName}'`);

    try {
      // 1. Check if there is already a collection with that name
      if (this.collectionExists(newCollectionName)) {
        return CollectionOperation.Duplicate;
      }
      // 2. Rename collection on disk
      let oldCollectionName: string = this.dataStore.getCollection(collectionId).name;
      let oldCollectionDirectoryPath: string = this.generateCollectionDirectoryPath(oldCollectionName);
      let newCollectionDirectoryPath: string = this.generateCollectionDirectoryPath(sanitizedNewCollectionName);
      await fs.move(oldCollectionDirectoryPath, newCollectionDirectoryPath);

      // 3. If rename on disk is success, rename in database
      this.dataStore.setCollectionName(collectionId, sanitizedNewCollectionName);
    } catch (error) {
      log.error(`Could not rename the collection with id='${collectionId}' to '${sanitizedNewCollectionName}'. Cause: ${error}`);
      return CollectionOperation.Error;
    }

    this.collectionRenamed.next(sanitizedNewCollectionName);

    return CollectionOperation.Success;
  }

  public async deleteCollectionAsync(collectionId: string): Promise<CollectionOperation> {
    if (!collectionId) {
      log.error("deleteCollectionAsync: collectionId is null");
      return CollectionOperation.Error;
    }

    let collectionName: string = ""; 

    try {
      // 1. Delete collection folder from disk
      collectionName = this.dataStore.getCollection(collectionId).name;
      let collectionDirectoryPath: string = this.generateCollectionDirectoryPath(collectionName);
      await fs.remove(collectionDirectoryPath);

      // 2. Delete collection from database (including its notebooks and notes)
      this.dataStore.deleteCollection(collectionId);
    } catch (error) {
      log.error(`Could not delete the collection with id='${collectionId}'. Cause: ${error}`);

      return CollectionOperation.Error;
    }

    this.collectionDeleted.next(collectionName);

    return CollectionOperation.Success;
  }
}