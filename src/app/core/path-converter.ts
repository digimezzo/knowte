import { Injectable } from '@angular/core';
import { Strings } from './strings';

@Injectable()
export class PathConverter {
    public constructor() {}

    public fileUriToOperatingSystemPath(fileUri: string): string {
        let operatingSystemPath: string = fileUri;

        operatingSystemPath = Strings.replaceAll(operatingSystemPath, 'file:///', '');
        operatingSystemPath = Strings.replaceAll(operatingSystemPath, '%20', ' ');

        if (operatingSystemPath.includes(':/')) {
            operatingSystemPath = Strings.replaceAll(operatingSystemPath, '/', '\\');
        } else {
            operatingSystemPath = `/${operatingSystemPath}`;
        }

        return operatingSystemPath;
    }

    public operatingSystemPathToFileUri(operatingSystemPath: string): string {
        let fileUri: string = operatingSystemPath;

        fileUri = Strings.replaceAll(fileUri, '\\', '/');
        fileUri = Strings.replaceAll(fileUri, ' ', '%20');
        fileUri = `file:///${fileUri}`;

        return fileUri;
    }
}
