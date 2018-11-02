import { Injectable } from '@angular/core';
import log from 'electron-log';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor() {
  }

  public hasCollections: boolean = true;

  public createStorageDirectory(storageDirectory: string): boolean {
    try {
      // TODO
    } catch (error) {
      log.error(`Could not create storage directory. Error: ${error}`);
      return false;
    }

    return true;
  }
}
