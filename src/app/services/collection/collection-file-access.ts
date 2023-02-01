import { Injectable } from '@angular/core';
import { BaseSettings } from '../../core/base-settings';
import { Constants } from '../../core/constants';
import { FileAccess } from '../../core/file-access';
import { NoteExport } from '../../core/note-export';

@Injectable()
export class CollectionFileAccess {
    public constructor(private fileAccess: FileAccess, private settings: BaseSettings) {}

    public async saveNoteContentAsync(noteId: string, noteContent: string, collection: string): Promise<void> {
        const noteContentFilePath: string = this.createNoteContentFilePath(noteId, collection);
        await this.fileAccess.writeToFileAsync(noteContentFilePath, noteContent);
    }

    public async getNoteContentAsync(noteContentFilePath: string): Promise<string> {
        return this.fileAccess.getFileContentAsStringAsync(noteContentFilePath);
    }

    public async getNoteContentByNoteIdAsync(noteId: string, collection: string): Promise<string> {
        const noteContentFilePath: string = this.createNoteContentFilePath(noteId, collection);

        return this.fileAccess.getFileContentAsStringAsync(noteContentFilePath);
    }

    public async deleteNoteFilesAsync(noteId: string, collection: string): Promise<void> {
        const noteContentFilePath: string = this.createNoteContentFilePath(noteId, collection);
        const noteStateFilePath: string = this.createNoteStateFilePath(noteId, collection);

        await this.fileAccess.deleteFileIfExistsAsync(noteContentFilePath);

        if (this.fileAccess.pathExists(noteStateFilePath)) {
            await this.fileAccess.deleteFileIfExistsAsync(noteStateFilePath);
        }
    }

    public async copyNoteFilesToCollectionAsync(noteId: string, collection: string): Promise<void> {
        const oldNoteContentFilePath: string = this.createNoteContentFilePath(noteId, collection);
        const newNoteContentFilePath: string = this.createNoteContentFilePathForGivenCollection(noteId, collection);
        await this.fileAccess.copyFileAsync(oldNoteContentFilePath, newNoteContentFilePath);

        const oldNoteStateFilePath: string = this.createNoteStateFilePath(noteId, collection);
        const newNoteStateFilePath: string = this.createNoteStateFilePathForGivenCollection(noteId, collection);
        await this.fileAccess.copyFileAsync(oldNoteStateFilePath, newNoteStateFilePath);
    }

    public async createCollectionDirectoryAsync(collectionDirectory: string): Promise<void> {
        await this.fileAccess.createFullDirectoryPathIfDoesNotExist(this.getDirectoryPathForGivenCollection(collectionDirectory));
    }

    public async createCollectionDirectoryIfNotExistsAsync(collectionDirectory: string): Promise<void> {
        const collectionDirectoryPath: string = this.getDirectoryPathForGivenCollection(collectionDirectory);

        if (!this.fileAccess.pathExists(collectionDirectoryPath)) {
            await this.fileAccess.createFullDirectoryPathIfDoesNotExist(collectionDirectoryPath);
        }
    }

    public async deleteCollectionDirectoryAsync(collectionDirectory: string): Promise<void> {
        await this.fileAccess.deleteDirectoryRecursively(this.getDirectoryPathForGivenCollection(collectionDirectory));
    }

    public createNoteContentFilePath(noteId: string, collection: string): string {
        return this.fileAccess.combinePath(this.getCollectionDirectoryPath(collection), `${noteId}${Constants.noteContentExtension}`);
    }

    private createNoteStateFilePath(noteId: string, collection: string): string {
        return this.fileAccess.combinePath(this.getCollectionDirectoryPath(collection), `${noteId}${Constants.noteStateExtension}`);
    }

    public createNoteContentFilePathForGivenCollection(noteId: string, collection: string): string {
        return this.fileAccess.combinePath(
            this.getDirectoryPathForGivenCollection(collection),
            `${noteId}${Constants.noteContentExtension}`
        );
    }

    private createNoteStateFilePathForGivenCollection(noteId: string, collection: string): string {
        return this.fileAccess.combinePath(this.getDirectoryPathForGivenCollection(collection), `${noteId}${Constants.noteStateExtension}`);
    }

    public getCollectionDirectoryPath(collection: string): string {
        return this.getDirectoryPathForGivenCollection(collection);
    }

    public getCollectionDatabasePath(collection: string): string {
        return this.fileAccess.combinePath(this.getCollectionDirectoryPath(collection), `${collection}.db`);
    }

    private getDirectoryPathForGivenCollection(collection: string): string {
        const storageDirectoryPath: string = this.settings.storageDirectory;

        return this.fileAccess.combinePath(storageDirectoryPath, collection);
    }

    public async collectionAndItsDirectoryExistAsync(collection: string): Promise<boolean> {
        const storageDirectory: string = this.settings.storageDirectory;
        let activeCollection: string = this.settings.activeCollection;

        if (!activeCollection) {
            return false;
        }

        const activeCollectionDirectoryPath: string = this.getCollectionDirectoryPath(collection);

        return (
            activeCollectionDirectoryPath.includes(storageDirectory) &&
            activeCollectionDirectoryPath !== storageDirectory &&
            (await this.fileAccess.pathExists(activeCollectionDirectoryPath))
        );
    }

    public renameCollectionFiles(oldCollection: string, newCollection: string): void {
        const oldCollectionDirectoryPath: string = this.getDirectoryPathForGivenCollection(oldCollection);
        const newCollectionDirectoryPath: string = this.getDirectoryPathForGivenCollection(newCollection);

        // 1. First, rename the database file.
        this.fileAccess.renameFileOrDirectory(
            this.fileAccess.combinePath(oldCollectionDirectoryPath, `${oldCollection}.db`),
            this.fileAccess.combinePath(oldCollectionDirectoryPath, `${newCollection}.db`)
        );

        // 2. Then, rename the directory.
        this.fileAccess.renameFileOrDirectory(oldCollectionDirectoryPath, newCollectionDirectoryPath);
    }

    public async getCollectionsAsync(): Promise<string[]> {
        const storageDirectory: string = this.settings.storageDirectory;
        const directoryPaths: string[] = await this.fileAccess.getDirectoriesInDirectoryAsync(storageDirectory);

        return directoryPaths.map((x) => this.fileAccess.getDirectoryOrFileName(x));
    }

    public hasStorageDirectory(): boolean {
        const storageDirectory: string = this.settings.storageDirectory;

        if (!storageDirectory || !this.fileAccess.pathExists(storageDirectory)) {
            return false;
        }

        return true;
    }

    public async saveNoteExportToFileAsync(exportFilePath: string, noteExport: NoteExport): Promise<void> {
        await this.fileAccess.writeToFileAsync(exportFilePath, JSON.stringify(noteExport));
    }

    public createStorageDirectory(parentDirectory: string): string {
        const storageDirectory: string = this.fileAccess.combinePath(parentDirectory, Constants.collectionsDirectory);
        this.fileAccess.createFullDirectoryPathIfDoesNotExist(storageDirectory);

        return storageDirectory;
    }
}
