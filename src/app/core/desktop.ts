import { Injectable } from '@angular/core';
import { remote } from 'electron';

@Injectable()
export class Desktop {
    public openLink(url: string): void {
        remote.shell.openExternal(url);
    }

    public showInFolder(fileName: string): void {
        remote.shell.showItemInFolder(fileName);
    }
}
