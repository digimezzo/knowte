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
            } catch (error) {
                if (continueOnError == undefined || !continueOnError) {
                    throw error;
                }

                if (errors != undefined) {
                    errors.push(error);
                }
            }
        }

        return confirmedDirectoryPaths;
    }

    public async getFilesInDirectoryAsync(directoryPath: string, continueOnError?: boolean, errors?: Error[]): Promise<string[]> {
        const possibleFileNames: string[] = await fs.readdir(directoryPath);
        const confirmedFilePaths: string[] = [];

        for (const possibleFileName of possibleFileNames) {
            const possibleFilePath: string = this.combinePath(directoryPath, possibleFileName);

            try {
                if (fs.lstatSync(possibleFilePath).isFile()) {
                    confirmedFilePaths.push(possibleFilePath);
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

        return confirmedFilePaths;
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

    public async writeTextToFileAsync(filePath: string, textToWrite: string): Promise<void> {
        await fs.writeFile(filePath, textToWrite);
    }

    public async writeBufferToFileAsync(filePath: string, bufferToWrite: Buffer): Promise<void> {
        await fs.writeFile(filePath, bufferToWrite);
    }

    public async getFileContentAsStringAsync(filePath: string): Promise<string> {
        return await fs.readFile(filePath, 'utf-8');
    }

    public getFileContentAsString(filePath: string): string {
        return fs.readFileSync(filePath, 'utf-8');
    }

    public getDirectoryOrFileName(directoryOrFilePath: string): string {
        return path.basename(directoryOrFilePath);
    }

    public async copyFileOrDirectoryAsync(oldPath: string, newPath: string): Promise<void> {
        return await fs.copy(oldPath, newPath, { overwrite: true });
    }

    public getFileName(fileNameOrPath: string): string {
        return path.basename(fileNameOrPath);
    }

    public getFileNameWithoutExtension(fileNameOrPath: string): string {
        const extension: string = path.extname(fileNameOrPath);
        return path.basename(fileNameOrPath, extension);
    }

    public getLastDirectoryInDirectoryPath(directoryPath: string): string {
        return path.dirname(directoryPath).split(path.sep).pop();
    }

    public async getFileContentAsBufferAsync(filePath: string): Promise<Buffer> {
        return await fs.readFile(filePath);
    }

    public getFileExtension(fileNameOrPath: string): string {
        return path.extname(fileNameOrPath);
    }

    public createWriteStream(path: string): fs.WriteStream {
        return fs.createWriteStream(path);
    }

    public createReadStream(path: string): fs.ReadStream {
        return fs.createReadStream(path);
    }
}
