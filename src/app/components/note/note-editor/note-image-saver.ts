import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CollectionFileAccess } from '../../../services/collection/collection-file-access';

@Injectable()
export class NoteImageSaver {
    private imageSaved: Subject<string> = new Subject();

    public constructor(private collectionFileAccess: CollectionFileAccess) {}

    public imageSaved$: Observable<string> = this.imageSaved.asObservable();

    public async saveImageAsync(noteId: string, collection: string, imageBuffer: Buffer, imageId: string): Promise<void> {
        await this.collectionFileAccess.createNoteImageFileAsync(noteId, collection, imageBuffer, imageId);
        this.imageSaved.next(imageId);
    }
}
