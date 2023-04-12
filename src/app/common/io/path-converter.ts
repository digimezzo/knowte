import { Injectable } from '@angular/core';
import { StringUtils } from '../utils/strings-utils';

@Injectable()
export class PathConverter {
    public constructor() {}

    public fileUriToOperatingSystemPath(fileUri: string): string {
        let operatingSystemPath: string = fileUri;

        operatingSystemPath = StringUtils.replaceAll(operatingSystemPath, 'file:///', '');
        operatingSystemPath = StringUtils.replaceAll(operatingSystemPath, '%20', ' ');

        if (operatingSystemPath.includes(':/')) {
            operatingSystemPath = StringUtils.replaceAll(operatingSystemPath, '/', '\\');
        } else {
            operatingSystemPath = `/${operatingSystemPath}`;
        }

        return operatingSystemPath;
    }

    public operatingSystemPathToFileUri(operatingSystemPath: string): string {
        let fileUri: string = operatingSystemPath;

        fileUri = StringUtils.replaceAll(fileUri, '\\', '/');
        fileUri = StringUtils.replaceAll(fileUri, ' ', '%20');
        fileUri = `file:///${fileUri}`;

        return fileUri;
    }
}
