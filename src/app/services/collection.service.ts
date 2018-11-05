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
  constructor(private noteStore: NoteStore) {
  }

  private storageDirectoryInitializedSubject = new Subject<boolean>();
  storageDirectoryInitialized$ = this.storageDirectoryInitializedSubject.asObservable();

  private store: Store = new Store();

  public hasCollections: boolean = this.hasStorageDirectory();

  public initializeStorageDirectory(storageDirectoryParent: string): boolean {
    try {
      // We don't need to create the storage directory if it already exists.
      if (!this.hasStorageDirectory()) {
        let storageDirectory: string = path.join(storageDirectoryParent, Constants.collectionsSubDirectory);
        // 1. Create the storage directory on disk
        fs.mkdirSync(storageDirectory);
        log.error(`Created storageDirectory '${storageDirectory}' on disk`);

        // 2. If storage directory creation succeeded, save the selected directory in the settings.
        this.saveStorageDirectory(storageDirectory);
      }
    } catch (error) {
      log.error(`Could not create storage directory. Cause: ${error}`);
      return false;
    }

    this.storageDirectoryInitializedSubject.next(true);
    return true;
  }

  public hasStorageDirectory(): boolean {
    // If we have a storage directory and it exists on disk, 
    // we assume that it can be used to store collections.
    let storageDirectoryFoundInSettings: boolean = this.store.has('storageDirectory');
    let storageDirectoryFoundOnDisk: boolean = fs.existsSync(this.store.get('storageDirectory'));

    if (storageDirectoryFoundInSettings && storageDirectoryFoundOnDisk) {
      log.info("Storage directory was found in the settings and on disk");
      return true;
    }

    log.info(`Storage directory was not found in the settings or on disk: storageDirectoryFoundInSettings=${storageDirectoryFoundInSettings}, storageDirectoryFoundOnDisk=${storageDirectoryFoundOnDisk}.`);
    return false;
  }

  public saveStorageDirectory(storageDirectory: string): boolean {
    try {
      this.store.set('storageDirectory', storageDirectory);
      log.error(`Saved storageDirectory '${storageDirectory}'`);
    } catch (error) {
      log.error(`Could not save storage directory. Cause: ${error}`);
      return false;
    }

    return true;
  }
}
