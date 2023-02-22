import { Injectable } from '@angular/core';
import { BaseSettings } from '../../core/base-settings';
import { Constants } from '../../core/constants';
import { FileAccess } from '../../core/file-access';
import { NoteExport } from '../../core/note-export';
import { Strings } from '../../core/strings';

@Injectable()
export class CollectionFileAccess {
    public constructor(private fileAccess: FileAccess, private settings: BaseSettings) {}

    public async saveNoteContentAsync(noteId: string, noteContent: string, collection: string, isMarkdownNote: boolean): Promise<void> {
        const noteContentFilePath: string = this.getNoteContentFilePath(noteId, collection, isMarkdownNote);
        await this.fileAccess.writeTextToFileAsync(noteContentFilePath, noteContent);
    }

    public async getNoteContentAsync(noteContentFilePath: string): Promise<string> {
        return this.fileAccess.getFileContentAsStringAsync(noteContentFilePath);
    }

    public async getNoteContentByNoteIdAsync(noteId: string, collection: string, isMarkdownNote: boolean): Promise<string> {
        const noteContentFilePath: string = this.getNoteContentFilePath(noteId, collection, isMarkdownNote);

        return this.fileAccess.getFileContentAsStringAsync(noteContentFilePath);
    }

    public getNoteContentByNoteId(noteId: string, collection: string, isMarkdownNote: boolean): string {
        const noteContentFilePath: string = this.getNoteContentFilePath(noteId, collection, isMarkdownNote);

        return this.fileAccess.getFileContentAsString(noteContentFilePath);
    }

    public async deleteNoteFilesAsync(noteId: string, collection: string, isMarkdownNote: boolean): Promise<void> {
        const noteContentFilePath: string = this.getNoteContentFilePath(noteId, collection, isMarkdownNote);
        const noteStateFilePath: string = this.getNoteStateFilePath(noteId, collection);

        await this.fileAccess.deleteFileIfExistsAsync(noteContentFilePath);

        if (this.fileAccess.pathExists(noteStateFilePath)) {
            await this.fileAccess.deleteFileIfExistsAsync(noteStateFilePath);
        }

        const noteAttachmentsDirectory: string = this.fileAccess.combinePath(this.getCollectionDirectoryPath(collection), noteId);
        this.fileAccess.deleteDirectoryRecursively(noteAttachmentsDirectory);
    }

    public async createCollectionDirectoryAsync(collectionDirectory: string): Promise<void> {
        await this.fileAccess.createFullDirectoryPathIfDoesNotExist(this.getCollectionDirectoryPath(collectionDirectory));
    }

    public async createCollectionDirectoryIfNotExistsAsync(collectionDirectory: string): Promise<void> {
        const collectionDirectoryPath: string = this.getCollectionDirectoryPath(collectionDirectory);

        if (!this.fileAccess.pathExists(collectionDirectoryPath)) {
            await this.fileAccess.createFullDirectoryPathIfDoesNotExist(collectionDirectoryPath);
        }
    }

    public async deleteCollectionDirectoryAsync(collectionDirectory: string): Promise<void> {
        await this.fileAccess.deleteDirectoryRecursively(this.getCollectionDirectoryPath(collectionDirectory));
    }

    public getNoteContentFilePath(noteId: string, collection: string, isMarkdownNote: boolean): string {
        let extension: string = Constants.classicNoteContentExtension;

        if (isMarkdownNote) {
            extension = Constants.markdownNoteContentExtension;
        }

        return this.fileAccess.combinePath(this.getCollectionDirectoryPath(collection), `${noteId}${extension}`);
    }

    private getNoteStateFilePath(noteId: string, collection: string): string {
        return this.fileAccess.combinePath(this.getCollectionDirectoryPath(collection), `${noteId}${Constants.noteStateExtension}`);
    }

    public getCollectionDirectoryPath(collection: string): string {
        return this.fileAccess.combinePath(this.settings.storageDirectory, collection);
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
        const oldCollectionDirectoryPath: string = this.getCollectionDirectoryPath(oldCollection);
        const newCollectionDirectoryPath: string = this.getCollectionDirectoryPath(newCollection);

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
        await this.fileAccess.writeTextToFileAsync(exportFilePath, JSON.stringify(noteExport));
    }

    public createStorageDirectory(parentDirectory: string): string {
        const storageDirectory: string = this.fileAccess.combinePath(parentDirectory, Constants.collectionsDirectory);
        this.fileAccess.createFullDirectoryPathIfDoesNotExist(storageDirectory);

        return storageDirectory;
    }

    public async createNoteImageFileAsync(noteId: string, collection: string, imageBuffer: Buffer, imageId: string): Promise<void> {
        const noteAttachmentsDirectoryPath: string = this.getAttachmentsDirectoryPath(noteId, collection);
        this.fileAccess.createFullDirectoryPathIfDoesNotExist(noteAttachmentsDirectoryPath);

        const noteImageFullPath: string = this.fileAccess.combinePath(noteAttachmentsDirectoryPath, `${imageId}.png`);
        this.fileAccess.writeBufferToFileAsync(noteImageFullPath, imageBuffer);
    }

    public async deleteUnusedNoteAttachmentsAsync(noteId: string, collection: string, noteText: string): Promise<void> {
        const noteAttachmentsDirectoryPath: string = this.getAttachmentsDirectoryPath(noteId, collection);
        const noteAttachmentFilePaths: string[] = await this.fileAccess.getFilesInDirectoryAsync(noteAttachmentsDirectoryPath);

        for (const noteAttachmentFilePath of noteAttachmentFilePaths) {
            const noteAttachmentFileName: string = this.fileAccess.getFileName(noteAttachmentFilePath);

            if (!noteText.includes(noteAttachmentFileName)) {
                await this.fileAccess.deleteFileIfExistsAsync(noteAttachmentFilePath);
            }
        }
    }

    public getAttachmentsDirectoryPath(noteId: string, collection: string): string {
        return this.fileAccess.combinePath(this.getCollectionDirectoryPath(collection), noteId);
    }

    public async copyAttachmentsAsync(noteId: string, collection: string, noteAttachmentsSourceDirectoryPath: string): Promise<void> {
        if (Strings.isNullOrWhiteSpace(noteAttachmentsSourceDirectoryPath)) {
            return;
        }

        if (!this.fileAccess.pathExists(noteAttachmentsSourceDirectoryPath)) {
            return;
        }

        const noteAttachmentsDestinationDirectoryPath: string = this.getAttachmentsDirectoryPath(noteId, collection);
        this.fileAccess.createFullDirectoryPathIfDoesNotExist(noteAttachmentsDestinationDirectoryPath);
        await this.fileAccess.copyFileOrDirectoryAsync(noteAttachmentsSourceDirectoryPath, noteAttachmentsDestinationDirectoryPath);
    }
}
