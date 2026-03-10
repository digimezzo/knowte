import { Injectable } from '@angular/core';
import { clipboard, nativeImage, NativeImage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ClipboardManager {
    private readonly supportedImageExtensions: string[] = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];

    public containsImage(): boolean {
        const availableFormats = clipboard.availableFormats('clipboard');

        if (availableFormats.includes('image/png') || availableFormats.includes('image/jpeg')) {
            return true;
        }

        if (this.getImagePathFromClipboardText()) {
            return true;
        }

        return false;
    }

    public containsText(): boolean {
        const text: string = clipboard.readText();

        if (text) {
            return true;
        }

        return false;
    }

    public writeText(text: string): void {
        clipboard.writeText(text);
    }

    public readText(): string {
        return clipboard.readText();
    }

    public readImage(): Blob {
        const imagePathFromClipboard: string | null = this.getImagePathFromClipboardText();
        const clipboardImage: NativeImage = imagePathFromClipboard
            ? nativeImage.createFromPath(imagePathFromClipboard)
            : clipboard.readImage();
        const blob: Blob = new Blob([clipboardImage.toJPEG(80)], { type: 'image/jpeg' });
        return blob;
    }

    private getImagePathFromClipboardText(): string | null {
        const clipboardText: string = clipboard.readText();

        if (!clipboardText) {
            return null;
        }

        const normalizedPath: string | null = this.normalizeClipboardPath(clipboardText);

        if (!normalizedPath || !this.isSupportedImagePath(normalizedPath)) {
            return null;
        }

        if (!fs.existsSync(normalizedPath)) {
            return null;
        }

        return normalizedPath;
    }

    private normalizeClipboardPath(clipboardText: string): string | null {
        const trimmedText: string = clipboardText.trim();

        if (!trimmedText || trimmedText.includes('\n') || trimmedText.includes('\r')) {
            return null;
        }

        const unquotedText: string = trimmedText.replace(/^"(.*)"$/, '$1');

        if (unquotedText.startsWith('file://')) {
            try {
                const fileUrlPath: string = decodeURIComponent(new URL(unquotedText).pathname);

                if (/^\/[a-zA-Z]:\//.test(fileUrlPath)) {
                    return fileUrlPath.substring(1);
                }

                return fileUrlPath;
            } catch {
                return null;
            }
        }

        return unquotedText;
    }

    private isSupportedImagePath(filePath: string): boolean {
        const fileExtension: string = path.extname(filePath).toLowerCase();
        return this.supportedImageExtensions.includes(fileExtension);
    }
}
