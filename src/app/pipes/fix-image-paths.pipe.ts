import { Pipe, PipeTransform } from '@angular/core';
import { BaseSettings } from '../core/base-settings';
import { PathConverter } from '../core/path-converter';
import { Strings } from '../core/strings';
import { CollectionFileAccess } from '../services/collection/collection-file-access';

@Pipe({
    name: 'fixImagePaths',
})
export class FixImagePathsPipe implements PipeTransform {
    public constructor(
        private collectionFileAccess: CollectionFileAccess,
        private pathConverter: PathConverter,
        private settings: BaseSettings
    ) {}

    public transform(value: string, noteId: string): string {
        if (!value) {
            return '';
        }

        let collectionDirectoryPath: string = this.collectionFileAccess.getCollectionDirectoryPath(this.settings.activeCollection);
        const collectionDirectoryFileUri: string = this.pathConverter.operatingSystemPathToFileUri(collectionDirectoryPath);

        const replacedText: string = Strings.replaceAll(value, './attachments/', `${collectionDirectoryFileUri}/${noteId}/`);

        return replacedText;
    }
}
