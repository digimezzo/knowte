import { Injectable } from '@angular/core';
import { BaseSettings } from '../../core/base-settings';
import { Note } from '../../data/entities/note';
import { CollectionFileAccess } from './collection-file-access';
import { NoteModel } from './note-model';

@Injectable()
export class NoteModelFactory {
    public constructor(private settings: BaseSettings, private collectionFileAccess: CollectionFileAccess) {}

    public create(note: Note): NoteModel {
        return new NoteModel(note, this.settings, this.collectionFileAccess);
    }
}
