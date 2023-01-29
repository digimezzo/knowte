import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class FileAccess {
    private pathSeparator: string = '';

    constructor() {
        this.pathSeparator = path.sep;
    }

    public combinePath(...pathPieces: string[]): string {
        if (pathPieces == undefined || pathPieces.length === 0) {
            return '';
        }

        if (pathPieces.length === 1) {
            return pathPieces[0];
        }

        const combinedPath: string = pathPieces.join(this.pathSeparator);

        return combinedPath;
    }

    public applicationDataDirectory(): string {
        return remote.app.getPath('userData');
    }

    public pathExists(pathToCheck: string): boolean {
        return fs.existsSync(pathToCheck);
    }

    public async deleteFileIfExistsAsync(filePath: string): Promise<void> {
        if (fs.existsSync(filePath)) {
            await fs.unlink(filePath);
        }
    }

    public renameFileOrDirectory(oldPath: string, newPath: string): void {
        fs.renameSync(oldPath, newPath);
    }

    public async getDirectoriesInDirectoryAsync(directoryPath: string, continueOnError?: boolean, errors?: Error[]): Promise<string[]> {
        const possibleDirectoryNames: string[] = await fs.readdir(directoryPath);
        const confirmedDirectoryPaths: string[] = [];

        for (const possibleDirectoryName of possibleDirectoryNames) {
            const possibleDirectoryPath: string = this.combinePath(directoryPath, possibleDirectoryName);

            try {
                if (fs.lstatSync(possibleDirectoryPath).isDirectory()) {
                    confirmedDirectoryPaths.push(possibleDirectoryPath);
                }
            } catch (e) {
                if (continueOnError == undefined || !continueOnError) {
                    throw e;
                }

                if (errors != undefined) {
                    errors.push(e);
                }
            }
        }

        return confirmedDirectoryPaths;
    }

    public createFullDirectoryPathIfDoesNotExist(directoryPath: string): boolean {
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });

            return true;
        }

        return false;
    }

    public async isDirectoryAsync(path: string): Promise<boolean> {
        const stat: any = await fs.stat(path);

        if (stat.isDirectory()) {
            return true;
        }

        return false;
    }

    public deleteDirectoryRecursively(directoryPath: string): void {
        fs.rmdirSync(directoryPath, { recursive: true });
    }

    public async writeToFileAsync(filePath: string, textToWrite: string): Promise<void> {
        await fs.writeFile(filePath, textToWrite);
    }

    public async getFileContentAsStringAsync(filePath: string): Promise<string> {
        return await fs.readFile(filePath, 'utf-8');
    }

    public getDirectoryOrFileName(directoryOrFilePath: string): string {
        return path.basename(directoryOrFilePath);
    }
}
