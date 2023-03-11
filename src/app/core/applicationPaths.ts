import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { Constants } from './constants';
import { FileAccess } from './file-access';

@Injectable()
export class ApplicationPaths {
    public constructor(private fileAccess: FileAccess) {}

    public applicationDataDirectoryPath(): string {
        return remote.app.getPath('userData');
    }

    public logFilePath(): string {
        return this.fileAccess.combinePath(this.applicationDataDirectoryPath(), 'logs', Constants.logFileName);
    }
}
