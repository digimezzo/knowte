import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';

@Injectable()
export class Desktop {
    public openLink(url: string): void {
        remote.shell.openExternal(url);
    }

    public showInFolder(fullPath: string): void {
        remote.shell.showItemInFolder(fullPath);
    }

    public openPath(fullPath: string): void {
        remote.shell.openPath(fullPath);
    }
}
