import { Injectable } from '@angular/core';
import log from 'electron-log';
import { NoteStore } from '../data/noteStore';
import * as Store from 'electron-store';
import * as fs from 'fs';
import { Constants } from '../core/constants';
import * as path from 'path';
import { Subject } from 'rxjs';
import { OperationResult } from './operationResult';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor(private noteStore: NoteStore) {
  }

  private storageDirectoryInitializedSubject = new Subject<boolean>();
  storageDirectoryInitialized$ = this.storageDirectoryInitializedSubject.asObservable();

  private store: Store = new Store();

  public hasCollections: boolean = this.hasStorageDirectory();
  private generarteStorageDirectoryPath(parentDirectory: string): string{
    return path.join(parentDirectory, Constants.collectionsSubDirectory);
  }

  private createStorageDirectoryOnDisk(storageDirectory: string): void {
    fs.mkdirSync(storageDirectory);
    log.info(`Created storageDirectory '${storageDirectory}' on disk`);
  }

  private saveStorageDirectoryInSettings(storageDirectory: string): void {
    this.store.set('storageDirectory', storageDirectory);
    log.info(`Saved storageDirectory '${storageDirectory}'`);
  }

  public initializeStorageDirectory(parentDirectory: string): OperationResult {

    let storageDirectory: string = "";

    try {
      // We don't need to create the storage directory if it already exists.
      if (!this.hasStorageDirectory()) {
        storageDirectory = this.generarteStorageDirectoryPath(parentDirectory);

        // 1. Create the storage directory on disk
        this.createStorageDirectoryOnDisk(storageDirectory);

        // 2. If storage directory creation succeeded, save the selected directory in the settings.
        this.saveStorageDirectoryInSettings(storageDirectory);

        // 3. Delete the old index database, if it exists, and create a new database.

        // 4. Create a default collection
      }
    } catch (error) {
      log.error(`Could not create storage directory. Cause: ${error}`);
      return new OperationResult(false, storageDirectory);
    }

    this.storageDirectoryInitializedSubject.next(true);
    return new OperationResult(true, storageDirectory);
  }

  public hasStorageDirectory(): boolean {
    // If we have a storage directory and it exists on disk, we assume that it can be used to store collections.
    let storageDirectoryFoundInSettings: boolean = this.store.has('storageDirectory');
    let storageDirectoryFoundOnDisk: boolean = fs.existsSync(this.store.get('storageDirectory'));

    if (storageDirectoryFoundInSettings && storageDirectoryFoundOnDisk) {
      log.info("Storage directory was found in the settings and on disk");
      return true;
    }

    log.info(`Storage directory was not found in the settings or on disk: storageDirectoryFoundInSettings=${storageDirectoryFoundInSettings}, storageDirectoryFoundOnDisk=${storageDirectoryFoundOnDisk}.`);
    return false;
  }
}
