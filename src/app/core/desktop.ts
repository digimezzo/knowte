import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';

@Injectable()
export class Desktop {
    public openLink(url: string): void {
        remote.shell.openExternal(url);
    }

    public showInFolder(fileName: string): void {
        remote.shell.showItemInFolder(fileName);
    }
}
