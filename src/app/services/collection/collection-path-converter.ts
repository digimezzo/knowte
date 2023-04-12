import { Injectable } from '@angular/core';
import { FileAccess } from '../../common/io/file-access';
import { BaseSettings } from '../../common/settings/base-settings';

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
