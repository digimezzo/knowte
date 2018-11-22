import { remote } from 'electron';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })
export class CollectionStore {
    constructor() {
    }

    private db = remote.getGlobal('collectionDb');
}