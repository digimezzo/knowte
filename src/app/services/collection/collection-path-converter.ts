import { Injectable } from '@angular/core';
import { BaseSettings } from '../../core/base-settings';
import { FileAccess } from '../../core/file-access';

@Injectable()
export class CollectionPathConverter {
    public constructor(private fileAccess: FileAccess, private settings: BaseSettings) {}

    public getCollectionNameFromCollectionDirectoryPath(collectionDirectoryPath: string): string {
        return this.fileAccess.getLastDirectoryInDirectoryPath(collectionDirectoryPath);
    }

    public getCollectionDirectoryPathFromCollectionName(collection: string): string {
        return this.fileAccess.combinePath(this.settings.storageDirectory, collection);
    }
}
