import { Injectable } from '@angular/core';
import { Constants } from '../application/constants';
import { Desktop } from './desktop';
import { FileAccess } from './file-access';

@Injectable()
export class LogViewer {
    public constructor(
        private desktop: Desktop,
        private fileAccess: FileAccess,
    ) {}

    public viewLog(): void {
        this.desktop.showInFolder(
            this.fileAccess.combinePath(this.desktop.applicationDataDirectoryPath(), 'logs', Constants.logFileName),
        );
    }
}
