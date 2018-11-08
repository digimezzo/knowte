import { Injectable } from '@angular/core';
import log from 'electron-log';
import { NoteStore } from '../data/noteStore';
import * as Store from 'electron-store';
import * as fs from 'fs';
import { Constants } from '../core/constants';
import * as path from 'path';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private settings: Store = new Store();
  private storageDirectoryInitializedSubject = new Subject<boolean>();
  storageDirectoryInitialized$ = this.storageDirectoryInitializedSubject.asObservable();

  constructor(private noteStore: NoteStore) {
    this.createDefaultCollectionDirectory();
  }

  public hasStorageDirectory: boolean = this.checkStorageDirectory();

  private checkStorageDirectory(): boolean {
    // If we have a storage directory in the settings and it exists on disk, we assume that it can be used to store collections.
    let storageDirectoryFoundInSettings: boolean = this.settings.has('storageDirectory');
    let settingsStorageDirectory: string = "";

    if (storageDirectoryFoundInSettings) {
      settingsStorageDirectory = this.settings.get('storageDirectory');

      if (fs.existsSync(settingsStorageDirectory)) {
        log.info("Storage directory was found in the settings and on disk");

        return true;
      }
    }

    log.info(`Storage directory was not found in the settings or on disk: storageDirectoryFoundInSettings=${storageDirectoryFoundInSettings}, storageDirectoryValueInSettings=${settingsStorageDirectory}.`);

    return false;
  }

  private createDefaultCollectionDirectory(): void {
    // If no storage directory is found, don't try to create a default collection directory.
    if (!this.hasStorageDirectory) {
      return;
    }

    let settingsStorageDirectory: string = this.settings.get('storageDirectory');

    // If there are no collections, create a default collection.
    let directories: string[] = fs.readdirSync(settingsStorageDirectory).filter(file => fs.statSync(path.join(settingsStorageDirectory, file)).isDirectory());

    if (directories.length === 0 || !directories.some(directory => directory.includes(Constants.collectionFoldersSuffix))) {
      let defaultCollectionName: string = `${Constants.defaultCollectionName} ${Constants.collectionFoldersSuffix}`;
      fs.mkdirSync(path.join(settingsStorageDirectory, defaultCollectionName));
      log.info(`No collections were found. Created new collection '${defaultCollectionName}'.`);
    }
  }

  // private updateIndexDatabase(): void {
  //   // For now, we're just resetting the database. Ultimately it would be 
  //   // better not to delete it and to check and udate the contents instead.
  //   this.noteStore.resetDatabase();
  // }

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

      // Save storage directory in the settings
      this.settings.set('storageDirectory', storageDirectory);
      log.info(`Saved storageDirectory in settings'${storageDirectory}'`);

      // Create a default collection
      this.createDefaultCollectionDirectory();
    } catch (error) {
      log.error(`Could not create storage directory on disk. Cause: ${error}`);

      return false;
    }

    return false;
  }

  // public initializeIndexDatabase(parentDirectory: string): boolean {

  //   let storageDirectory: string = "";

  //   try {
  //     // We don't need to create the storage directory if it already exists.
  //     if (!this.hasStorageDirectory()) {
  //       storageDirectory = this.generateStorageDirectoryPath(parentDirectory);

  //       // 1. Create the storage directory on disk
  //       this.createStorageDirectory(storageDirectory);

  //       // 2. If storage directory creation succeeded, save the selected directory in the settings.
  //       this.saveStorageDirectoryInSettings(storageDirectory);

  //       // 3. Update the index database.
  //       this.updateIndexDatabase();
  //     }
  //   } catch (error) {
  //     log.error(`Could not create storage directory. Cause: ${error}`);
  //     return false;
  //   }

  //   this.storageDirectoryInitializedSubject.next(true);
  //   return true;
  // }
}
