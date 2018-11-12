import { Injectable } from '@angular/core';
import log from 'electron-log';
import { DataStore } from '../data/dataStore';
import * as Store from 'electron-store';
import * as fs from 'fs';
import { Constants } from '../core/constants';
import * as path from 'path';
import { Subject } from 'rxjs';
import { Collection } from '../data/collection';
import { CollectionOperation } from './collectionOperation';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  // private settings: Store = new Store();

  private storageDirectoryChanged = new Subject<boolean>();
  storageDirectoryChanged$ = this.storageDirectoryChanged.asObservable();

  private collectionsChanged = new Subject();
  collectionsChanged$ = this.collectionsChanged.asObservable();

  constructor(private dataStore: DataStore) {
    this.createDefaultCollectionDirectory();
  }

  public get hasStorageDirectory(): boolean {
    return this.checkStorageDirectory();
  }

  private getCollectionDirectories(): string[] {
    let settingsStorageDirectory: string = this.dataStore.getStorageDirectory();
    let collectionDirectories: string[] = fs.readdirSync(settingsStorageDirectory).filter(file => fs.statSync(path.join(settingsStorageDirectory, file)).isDirectory() && file.includes(Constants.collectionFoldersSuffix));

    return collectionDirectories;
  }

  private createDefaultCollectionDirectory(): void {
    // If no storage directory is found, don't try to create a default collection directory.
    if (!this.hasStorageDirectory) {
      log.info("Not creating default collection, because there is no storage directory.");
      return;
    }

    let settingsStorageDirectory: string = this.dataStore.getStorageDirectory();

    // If there are no collections, create a default collection.
    let directories: string[] = fs.readdirSync(settingsStorageDirectory).filter(file => fs.statSync(path.join(settingsStorageDirectory, file)).isDirectory());

    if (this.getCollectionDirectories().length == 0) {
      let defaultCollectionName: string = `${Constants.defaultCollectionName} ${Constants.collectionFoldersSuffix}`;
      fs.mkdirSync(path.join(settingsStorageDirectory, defaultCollectionName));
      log.info(`No collections were found. Created new collection '${defaultCollectionName}'.`);
    }
  }

  private checkStorageDirectory(): boolean {
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

  private importNotes(): void {
    // Make sure we start from scratch
    this.dataStore.clearDataStore();

    let collectionDirectories: string[] = this.getCollectionDirectories();
    log.info(`Found ${collectionDirectories.length} collection directories`);

    let isActive: boolean = true;

    for (let collectionDirectory of collectionDirectories) {
      this.dataStore.addCollection(collectionDirectory, isActive);
      isActive = false; // Only the first collection we find, must be active.
    }

    // TODO: import notes

    this.collectionsChanged.next();
  }

  public initializeStorageDirectory(parentDirectory: string): boolean {
    try {
      // Generate storage directory path based on parent directory
      let storageDirectory: string = path.join(parentDirectory, Constants.collectionsSubDirectory);

      // Create storage directory if it doesn't exist
      if (!fs.existsSync(storageDirectory)) {
        fs.mkdirSync(storageDirectory);
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
      this.importNotes();
    } catch (error) {
      log.error(`Could not create storage directory on disk. Cause: ${error}`);

      return false;
    }

    this.storageDirectoryChanged.next(true);

    return true;
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

  public addCollection(name: string): CollectionOperation {

    // Check if there is already a collection with that name
    if (this.dataStore.getCollectionsByName(name).length > 0) {
      return CollectionOperation.Duplicate;
    }

    // Add the collection
    try {
      this.dataStore.addCollection(name, false);
      log.info(`Added collection '${name}'`);
    } catch (error) {
      log.error(`Could not add collection '${name}'. Cause: ${error}`);
      return CollectionOperation.Error;
    }

    return CollectionOperation.Success;
  }
}