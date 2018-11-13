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

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor(private dataStore: DataStore) {
    this.createDefaultCollectionDirectory();
  }

  // private settings: Store = new Store();

  private storageDirectoryChanged = new Subject<boolean>();
  storageDirectoryChanged$ = this.storageDirectoryChanged.asObservable();

  private collectionsChanged = new Subject();
  collectionsChanged$ = this.collectionsChanged.asObservable();

  // private async getCollectionDirectoriesAsync(): Promise<string[]> {
  //   let settingsStorageDirectory: string = this.dataStore.getStorageDirectory();
  //   let fileNames: string[] = await fs.readdir(settingsStorageDirectory);
  //   let collectionDirectories: string[] = [];

  //   for (let fileName of fileNames) {
  //     let absoluteFilePath: string = path.join(settingsStorageDirectory, fileName);
  //     let stat: any = await fs.stat(absoluteFilePath);

  //     if (stat.isDirectory() && fileName.includes(Constants.collectionFoldersSuffix)) {
  //       collectionDirectories.push(fileName);
  //     }
  //   }

  //   return collectionDirectories;
  // }

  // private async createDefaultCollectionDirectoryAsync(): Promise<void> {
  //   // If no storage directory is found, don't try to create a default collection directory.
  //   if (!await this.hasStorageDirectoryAsync()) {
  //     log.info("Not creating default collection, because there is no storage directory.");
  //     return;
  //   }

  //   let settingsStorageDirectory: string = this.dataStore.getStorageDirectory();
  //   let collectionDirectories: string[] = await this.getCollectionDirectoriesAsync();

  //   // If there are no collections, create a default collection.
  //   if (collectionDirectories.length == 0) {
  //     let defaultCollectionName: string = `${Constants.defaultCollectionName} ${Constants.collectionFoldersSuffix}`;
  //     await fs.mkdir(path.join(settingsStorageDirectory, defaultCollectionName));
  //     log.info(`No collections were found. Created new collection '${defaultCollectionName}'.`);
  //   }
  // }

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

  private createDefaultCollectionDirectory(): void {
    // If no storage directory is found, don't try to create a default collection directory.
    if (!this.hasStorageDirectory()) {
      log.info("Not creating default collection, because there is no storage directory.");
      return;
    }

    let settingsStorageDirectory: string = this.dataStore.getStorageDirectory();
    let collectionDirectories: string[] = this.getCollectionDirectories();

    // If there are no collections, create a default collection.
    if (collectionDirectories.length == 0) {
      let defaultCollectionName: string = `${Constants.defaultCollectionName} ${Constants.collectionFoldersSuffix}`;
      fs.mkdirSync(path.join(settingsStorageDirectory, defaultCollectionName));
      log.info(`No collections were found. Created new collection '${defaultCollectionName}'.`);
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

  private async importNotesAsync(): Promise<void> {
    // Make sure we start from scratch
    this.dataStore.clearDataStore();

    let collectionDirectories: string[] = this.getCollectionDirectories();
    log.info(`Found ${collectionDirectories.length} collection directories`);

    let isActive: number = 1;

    for (let collectionDirectory of collectionDirectories) {
      this.dataStore.addCollection(collectionDirectory, isActive);
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

  public async addCollectionAsync(name: string): Promise<CollectionOperation> {
    // Check if a collection name was provided
    if (!name) {
      return CollectionOperation.Error;
    }

    // Check if there is already a collection with that name
    let collections: Collection[] = this.dataStore.getCollectionsByName(name);

    if (collections.length > 0) {
      return CollectionOperation.Duplicate;
    }

    try {
      // Add the collection to disk
      let settingsStorageDirectory: string = this.dataStore.getStorageDirectory();
      let collectionName: string = `${name} ${Constants.collectionFoldersSuffix}`;
      await fs.mkdir(path.join(settingsStorageDirectory, collectionName));
      log.info(`Added collection '${name}' to disk`);

      // Add the collection to the data store
      this.dataStore.addCollection(name, 0);
      log.info(`Added collection '${name}' to data store`);
    } catch (error) {
      log.error(`Could not add collection '${name}'. Cause: ${error}`);

      return CollectionOperation.Error;
    }

    this.collectionsChanged.next();

    return CollectionOperation.Success;
  }

  public activateCollection(collectionId: string): void {
    this.dataStore.activateCollection(collectionId);
    this.collectionsChanged.next();
  }
}