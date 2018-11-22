import { remote } from 'electron';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })
export class NoteStore {
    constructor() {
    }

    private db = remote.getGlobal('notesDb');
}