import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import * as path from 'path';

@Injectable()
export class FileSystem {
    private _pathSeparator: string = '';

    constructor() {
        this._pathSeparator = path.sep;
    }

    public combinePath(pathPieces: string[]): string {
        if (pathPieces == undefined || pathPieces.length === 0) {
            return '';
        }

        if (pathPieces.length === 1) {
            return pathPieces[0];
        }

        const combinedPath: string = pathPieces.join(this._pathSeparator);

        return combinedPath;
    }

    public applicationDataDirectory(): string {
        return remote.app.getPath('userData');
    }
}
