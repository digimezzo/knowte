import { Injectable } from '@angular/core';
import { FileAccess } from '../../common/io/file-access';
import { BaseSettings } from '../../common/settings/base-settings';
import { StringUtils } from '../../common/utils/strings-utils';
import { CollectionFileAccess } from '../collection/collection-file-access';
import { CryptographyService } from '../cryptography/cryptography.service';
import { TemporaryStorageService } from '../temporary-storage/temporary-storage.service';

@Injectable()
export class PersistanceService {
    private static readonly encryptedAttachmentExtension: string = '.enc';

    constructor(
        private collectionFileAccess: CollectionFileAccess,
        private cryptography: CryptographyService,
        private settings: BaseSettings,
        private fileAccess: FileAccess,
        private temporaryStorageService: TemporaryStorageService,
    ) {}

    public async getNoteContentAsync(noteId: string, isEncrypted: boolean, secretKey: string, isMarkdownNote: boolean): Promise<string> {
        const noteContent: string = await this.collectionFileAccess.getNoteContentByNoteIdAsync(
            noteId,
            this.settings.activeCollection,
            isMarkdownNote,
        );

        if (isEncrypted && !StringUtils.isNullOrWhiteSpace(secretKey)) {
            return this.cryptography.decrypt(noteContent, secretKey);
        }

        return noteContent;
    }

    public async updateNoteContentAsync(
        noteId: string,
        noteJsonContent: string,
        isEncrypted: boolean,
        secretKey: string,
        isMarkdownNote: boolean,
    ): Promise<void> {
        let contentToWrite: string = noteJsonContent;

        if (isEncrypted && !StringUtils.isNullOrWhiteSpace(secretKey)) {
            contentToWrite = this.cryptography.encrypt(noteJsonContent, secretKey);
        }

        await this.collectionFileAccess.saveNoteContentAsync(noteId, contentToWrite, this.settings.activeCollection, isMarkdownNote);

        if (isMarkdownNote) {
            await this.syncMarkdownAttachmentEncryptionStateAsync(noteId, isEncrypted, secretKey);
        }
    }

    public async getNoteAttachmentsDirectoryPathForPreviewAsync(
        noteId: string,
        isEncrypted: boolean,
        secretKey: string,
        isMarkdownNote: boolean,
    ): Promise<string> {
        const noteAttachmentsDirectoryPath: string = this.collectionFileAccess.getNoteAttachmentsDirectoryPath(
            noteId,
            this.settings.activeCollection,
        );

        if (!isMarkdownNote || !isEncrypted || StringUtils.isNullOrWhiteSpace(secretKey)) {
            this.clearNoteAttachmentsPreviewDirectory(noteId);
            return noteAttachmentsDirectoryPath;
        }

        const decryptedAttachmentsDirectoryPath: string = this.getDecryptedAttachmentsDirectoryPath(noteId);

        if (this.fileAccess.pathExists(decryptedAttachmentsDirectoryPath)) {
            this.fileAccess.deleteDirectoryRecursively(decryptedAttachmentsDirectoryPath);
        }

        this.fileAccess.createFullDirectoryPathIfDoesNotExist(decryptedAttachmentsDirectoryPath);

        if (!this.fileAccess.pathExists(noteAttachmentsDirectoryPath)) {
            return decryptedAttachmentsDirectoryPath;
        }

        const noteAttachmentPaths: string[] = await this.fileAccess.getFilesInDirectoryAsync(noteAttachmentsDirectoryPath);

        for (const noteAttachmentPath of noteAttachmentPaths) {
            const noteAttachmentFileName: string = this.fileAccess.getFileName(noteAttachmentPath);
            const decryptedAttachmentPath: string = this.getDecryptedAttachmentFilePath(
                decryptedAttachmentsDirectoryPath,
                noteAttachmentFileName,
            );

            if (noteAttachmentFileName.endsWith(PersistanceService.encryptedAttachmentExtension)) {
                const encryptedAttachmentBuffer: Buffer = await this.fileAccess.getFileContentAsBufferAsync(noteAttachmentPath);
                const decryptedAttachmentBuffer: Buffer = this.cryptography.decryptBuffer(encryptedAttachmentBuffer, secretKey);

                await this.fileAccess.writeBufferToFileAsync(decryptedAttachmentPath, decryptedAttachmentBuffer);
            } else {
                await this.fileAccess.copyFileOrDirectoryAsync(noteAttachmentPath, decryptedAttachmentPath);
            }
        }

        return decryptedAttachmentsDirectoryPath;
    }

    public clearNoteAttachmentsPreviewDirectory(noteId: string): void {
        const decryptedAttachmentsDirectoryPath: string = this.getDecryptedAttachmentsDirectoryPath(noteId);

        if (this.fileAccess.pathExists(decryptedAttachmentsDirectoryPath)) {
            this.fileAccess.deleteDirectoryRecursively(decryptedAttachmentsDirectoryPath);
        }
    }

    public async exportNoteAsync(
        exportFilePath: string,
        noteId: string,
        noteTitle: string,
        noteText: string,
        noteContent: string,
        isMarkdownNote: boolean,
    ): Promise<void> {
        await this.collectionFileAccess.exportNoteAsync(exportFilePath, noteId, noteTitle, noteText, noteContent, isMarkdownNote);
    }

    private async syncMarkdownAttachmentEncryptionStateAsync(noteId: string, isEncrypted: boolean, secretKey: string): Promise<void> {
        const noteAttachmentsDirectoryPath: string = this.collectionFileAccess.getNoteAttachmentsDirectoryPath(
            noteId,
            this.settings.activeCollection,
        );

        if (!this.fileAccess.pathExists(noteAttachmentsDirectoryPath)) {
            return;
        }

        const noteAttachmentPaths: string[] = await this.fileAccess.getFilesInDirectoryAsync(noteAttachmentsDirectoryPath);

        if (isEncrypted && !StringUtils.isNullOrWhiteSpace(secretKey)) {
            for (const noteAttachmentPath of noteAttachmentPaths) {
                if (noteAttachmentPath.endsWith(PersistanceService.encryptedAttachmentExtension)) {
                    continue;
                }

                const noteAttachmentBuffer: Buffer = await this.fileAccess.getFileContentAsBufferAsync(noteAttachmentPath);
                const encryptedAttachmentBuffer: Buffer = this.cryptography.encryptBuffer(noteAttachmentBuffer, secretKey);
                const encryptedAttachmentPath: string = `${noteAttachmentPath}${PersistanceService.encryptedAttachmentExtension}`;

                await this.fileAccess.writeBufferToFileAsync(encryptedAttachmentPath, encryptedAttachmentBuffer);
                await this.fileAccess.deleteFileIfExistsAsync(noteAttachmentPath);
            }

            return;
        }

        for (const noteAttachmentPath of noteAttachmentPaths) {
            if (!noteAttachmentPath.endsWith(PersistanceService.encryptedAttachmentExtension)) {
                continue;
            }

            const encryptedAttachmentBuffer: Buffer = await this.fileAccess.getFileContentAsBufferAsync(noteAttachmentPath);
            const decryptedAttachmentBuffer: Buffer = this.cryptography.decryptBuffer(encryptedAttachmentBuffer, secretKey);
            const decryptedAttachmentPath: string = noteAttachmentPath.slice(0, -PersistanceService.encryptedAttachmentExtension.length);

            await this.fileAccess.writeBufferToFileAsync(decryptedAttachmentPath, decryptedAttachmentBuffer);
            await this.fileAccess.deleteFileIfExistsAsync(noteAttachmentPath);
        }
    }

    private getDecryptedAttachmentsDirectoryPath(noteId: string): string {
        const temporaryStorageDirectoryPath: string = this.temporaryStorageService.getTemporaryStorageDirectoryPath();

        return this.fileAccess.combinePath(
            temporaryStorageDirectoryPath,
            'decrypted-markdown-attachments',
            this.settings.activeCollection,
            noteId,
        );
    }

    private getDecryptedAttachmentFilePath(decryptedAttachmentsDirectoryPath: string, noteAttachmentFileName: string): string {
        const decryptedFileName: string = noteAttachmentFileName.endsWith(PersistanceService.encryptedAttachmentExtension)
            ? noteAttachmentFileName.slice(0, -PersistanceService.encryptedAttachmentExtension.length)
            : noteAttachmentFileName;

        return this.fileAccess.combinePath(decryptedAttachmentsDirectoryPath, decryptedFileName);
    }
}
