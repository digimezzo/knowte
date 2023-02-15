import { Pipe, PipeTransform } from '@angular/core';
import { BaseSettings } from '../core/base-settings';
import { Strings } from '../core/strings';
import { CollectionFileAccess } from '../services/collection/collection-file-access';

@Pipe({
    name: 'fixImagePaths',
})
export class FixImagePathsPipe implements PipeTransform {
    public constructor(private collectionFileAccess: CollectionFileAccess, private settings: BaseSettings) {}

    public transform(value: string, noteId: string): string {
        if (!value) {
            return '';
        }

        let collectionDirectoryPath: string = this.collectionFileAccess.getCollectionDirectoryPath(this.settings.activeCollection);
        collectionDirectoryPath = Strings.replaceAll(collectionDirectoryPath, '\\', '/');
        collectionDirectoryPath = Strings.replaceAll(collectionDirectoryPath, ' ', '%20');

        const replacedText: string = Strings.replaceAll(value, './attachments/', `file:///${collectionDirectoryPath}/${noteId}/`);

        return replacedText;
    }
}
