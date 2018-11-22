import { remote } from 'electron';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })
export class NotebookStore {
    constructor() {
    }

    private db = remote.getGlobal('notebooksDb');
}