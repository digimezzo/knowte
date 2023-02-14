import { Injectable } from '@angular/core';

@Injectable()
export class ImagePathConverter {
    public convertToFullImagePaths(text: string): string {
        if (!text) {
            return '';
        }

        const replacedText: string = text.replace(
            './attachments/',
            'file:///home/raphael/Dropbox/Documents/Knowte%20collections/Test/attachments/'
        );

        return replacedText;
    }
}
