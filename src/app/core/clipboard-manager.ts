import { Injectable } from "@angular/core";
import { clipboard, NativeImage } from 'electron';

@Injectable({
    providedIn: 'root'
})
export class ClipboardManager {
    public containsImage(): boolean {
        let availableFormats = clipboard.availableFormats("clipboard");

        if (availableFormats.includes("image/png") || availableFormats.includes("image/jpeg")) {
            return true;
        }

        return false;
    }

    public containsText(): boolean {
        let text: string = clipboard.readText();

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
        let clipboardImage: NativeImage = clipboard.readImage();
        let blob: Blob = new Blob([clipboardImage.toJPEG(80)], { type: 'image/jpeg' });
        return blob;
    }
}