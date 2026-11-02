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
    private static readonly upgradeTemporaryFileExtension: string = '.upgrade';

    constructor(
        private collectionFileAccess: CollectionFileAccess,
        private cryptography: CryptographyService,
        private settings: BaseSettings,
        private fileAccess: FileAccess,
        private temporaryStorageService: TemporaryStorageService,
    ) {}

    public async isSecretKeyCorrectAsync(noteId: string, secretKey: string, isMarkdownNote: boolean): Promise<boolean> {
        const noteContent: string = await this.collectionFileAccess.getNoteContentByNoteIdAsync(
            noteId,
            this.settings.activeCollection,
            isMarkdownNote,
        );

        if (!this.cryptography.isCurrentTextFormat(noteContent)) {
            // Nothing to verify against; loading the content reports the problem.
            return true;
        }

        try {
            this.cryptography.decrypt(noteContent, secretKey);

            return true;
        } catch {
            return false;
        }
    }

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
        upgradeLegacyEncryption: boolean = false,
    ): Promise<void> {
        let contentToWrite: string = noteJsonContent;

        if (isEncrypted && !StringUtils.isNullOrWhiteSpace(secretKey)) {
            contentToWrite = this.cryptography.encrypt(noteJsonContent, secretKey);
        }

        await this.collectionFileAccess.saveNoteContentAsync(noteId, contentToWrite, this.settings.activeCollection, isMarkdownNote);

        if (isMarkdownNote) {
            await this.syncMarkdownAttachmentEncryptionStateAsync(noteId, isEncrypted, secretKey, upgradeLegacyEncryption);
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
            await this.fileAccess.deleteDirectoryRecursivelyAsync(this.getDecryptedAttachmentsDirectoryPath(noteId));
            return noteAttachmentsDirectoryPath;
        }

        const decryptedAttachmentsDirectoryPath: string = this.getDecryptedAttachmentsDirectoryPath(noteId);

        await this.fileAccess.deleteDirectoryRecursivelyAsync(decryptedAttachmentsDirectoryPath);
        await this.fileAccess.createFullDirectoryPathIfDoesNotExistAsync(decryptedAttachmentsDirectoryPath);

        if (!(await this.fileAccess.pathExistsAsync(noteAttachmentsDirectoryPath))) {
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
        tags: string[] = [],
    ): Promise<void> {
        await this.collectionFileAccess.exportNoteAsync(exportFilePath, noteId, noteTitle, noteText, noteContent, isMarkdownNote, tags);
    }

    private async syncMarkdownAttachmentEncryptionStateAsync(
        noteId: string,
        isEncrypted: boolean,
        secretKey: string,
        upgradeLegacyEncryption: boolean,
    ): Promise<void> {
        const noteAttachmentsDirectoryPath: string = this.collectionFileAccess.getNoteAttachmentsDirectoryPath(
            noteId,
            this.settings.activeCollection,
        );

        if (!(await this.fileAccess.pathExistsAsync(noteAttachmentsDirectoryPath))) {
            return;
        }

        const noteAttachmentPaths: string[] = await this.fileAccess.getFilesInDirectoryAsync(noteAttachmentsDirectoryPath);

        if (isEncrypted && !StringUtils.isNullOrWhiteSpace(secretKey)) {
            for (const noteAttachmentPath of noteAttachmentPaths) {
                if (noteAttachmentPath.endsWith(PersistanceService.upgradeTemporaryFileExtension)) {
                    // Left behind by an interrupted upgrade; the original file is still intact.
                    await this.fileAccess.deleteFileIfExistsAsync(noteAttachmentPath);
                    continue;
                }

                if (noteAttachmentPath.endsWith(PersistanceService.encryptedAttachmentExtension)) {
                    if (upgradeLegacyEncryption) {
                        await this.upgradeAttachmentEncryptionAsync(noteAttachmentPath, secretKey);
                    }

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

    private async upgradeAttachmentEncryptionAsync(encryptedAttachmentPath: string, secretKey: string): Promise<void> {
        const encryptedAttachmentBuffer: Buffer = await this.fileAccess.getFileContentAsBufferAsync(encryptedAttachmentPath);

        if (this.cryptography.isCurrentBufferFormat(encryptedAttachmentBuffer)) {
            return;
        }

        const upgradedAttachmentBuffer: Buffer = this.cryptography.encryptBuffer(
            this.cryptography.decryptBuffer(encryptedAttachmentBuffer, secretKey),
            secretKey,
        );
        const temporaryPath: string = `${encryptedAttachmentPath}${PersistanceService.upgradeTemporaryFileExtension}`;

        await this.fileAccess.writeBufferToFileAsync(temporaryPath, upgradedAttachmentBuffer);
        this.fileAccess.renameFileOrDirectory(temporaryPath, encryptedAttachmentPath);
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
