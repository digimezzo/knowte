import { Injectable } from '@angular/core';
import * as extract from 'extract-zip';
import { nanoid } from 'nanoid';
import { ApplicationPaths } from '../../core/applicationPaths';
import { FileAccess } from '../../core/file-access';
import { Logger } from '../../core/logger';

@Injectable()
export class TemporaryStorageService {
    private temporaryStorageDirectoryPath: string = this.fileAccess.combinePath(
        this.applicationPaths.applicationDataDirectoryPath(),
        'TemporaryStorage'
    );

    public constructor(private fileAccess: FileAccess, private applicationPaths: ApplicationPaths, private logger: Logger) {}

    private ensureTemporaryStorageDirectory(): void {
        this.fileAccess.createFullDirectoryPathIfDoesNotExist(this.temporaryStorageDirectoryPath);
    }

    public async createPrintHtmlFileAsync(printHtmlFileContent: string): Promise<string> {
        this.ensureTemporaryStorageDirectory();

        const printHtmlFilePath: string = this.fileAccess.combinePath(this.temporaryStorageDirectoryPath, 'print.html');

        await this.fileAccess.writeTextToFileAsync(printHtmlFilePath, printHtmlFileContent);

        return printHtmlFilePath;
    }

    public async extractArchiveAsync(archivePath: string): Promise<string> {
        const directoryName: string = nanoid();
        const extractionPath: string = this.fileAccess.combinePath(this.temporaryStorageDirectoryPath, directoryName);
        this.fileAccess.createFullDirectoryPathIfDoesNotExist(extractionPath);

        try {
            await extract(archivePath, { dir: extractionPath });
        } catch (error) {
            this.logger.error(
                `Could not extract archive '${archivePath}' to '${extractionPath}'. Error: ${error.message}`,
                'TemporaryStorageService',
                'extractArchiveAsync'
            );

            throw error;
        }

        return extractionPath;
    }
}
