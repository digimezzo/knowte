import { Injectable } from '@angular/core';
import { Backend } from './backend';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor() {
  }

  public hasCollections: boolean = true;
}
