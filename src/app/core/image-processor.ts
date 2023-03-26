import { Injectable } from '@angular/core';
import { FileAccess } from './io/file-access';

@Injectable()
export class ImageProcessor {
    public constructor(private fileAccess: FileAccess) {}

    public async convertLocalImageToBufferAsync(imagePath: string): Promise<Buffer> {
        const imageBuffer: Buffer = await this.fileAccess.getFileContentAsBufferAsync(imagePath);

        return imageBuffer;
    }
}
