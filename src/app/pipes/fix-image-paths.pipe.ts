import { Pipe, PipeTransform } from '@angular/core';
import { PathConverter } from '../common/io/path-converter';
import { BaseSettings } from '../common/settings/base-settings';
import { StringUtils } from '../common/utils/strings-utils';
import { CollectionFileAccess } from '../services/collection/collection-file-access';

@Pipe({
    name: 'fixImagePaths',
})
export class FixImagePathsPipe implements PipeTransform {
    public constructor(
        private collectionFileAccess: CollectionFileAccess,
        private pathConverter: PathConverter,
        private settings: BaseSettings,
    ) {}

    public transform(value: string, noteId: string, attachmentsDirectoryPath?: string): string {
        if (!value) {
            return '';
        }

        const resolvedAttachmentsDirectoryPath: string = attachmentsDirectoryPath
            ? attachmentsDirectoryPath
            : this.collectionFileAccess.getNoteAttachmentsDirectoryPath(noteId, this.settings.activeCollection);
        const attachmentsDirectoryFileUri: string = this.pathConverter.operatingSystemPathToFileUri(resolvedAttachmentsDirectoryPath);

        const replacedText: string = StringUtils.replaceAll(value, './attachments/', `${attachmentsDirectoryFileUri}/`);

        return replacedText;
    }
}
