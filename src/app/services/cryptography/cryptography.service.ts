import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as crypto from 'crypto';

@Injectable()
export class CryptographyService {
    private static readonly initializationVectorLength: number = 16;
    private static readonly authenticationTagLength: number = 16;

    public encrypt(text: string, secretKey: string): string {
        const encryptedText: string = CryptoJS.AES.encrypt(text, secretKey).toString();

        return encryptedText;
    }

    public decrypt(text: string, secretKey: string): string {
        const decryptedText: string = CryptoJS.AES.decrypt(text, secretKey).toString(CryptoJS.enc.Utf8);

        return decryptedText;
    }

    public createHash(text: string): string {
        return CryptoJS.SHA256(text).toString();
    }

    public encryptBuffer(buffer: Buffer, secretKey: string): Buffer {
        const key: Buffer = this.createAesKey(secretKey);
        const initializationVector: Buffer = crypto.randomBytes(CryptographyService.initializationVectorLength);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, initializationVector);

        const encryptedBuffer: Buffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
        const authenticationTag: Buffer = cipher.getAuthTag();

        return Buffer.concat([initializationVector, authenticationTag, encryptedBuffer]);
    }

    public decryptBuffer(buffer: Buffer, secretKey: string): Buffer {
        const key: Buffer = this.createAesKey(secretKey);
        const initializationVector: Buffer = buffer.subarray(0, CryptographyService.initializationVectorLength);
        const authenticationTag: Buffer = buffer.subarray(
            CryptographyService.initializationVectorLength,
            CryptographyService.initializationVectorLength + CryptographyService.authenticationTagLength,
        );
        const encryptedBuffer: Buffer = buffer.subarray(
            CryptographyService.initializationVectorLength + CryptographyService.authenticationTagLength,
        );

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, initializationVector);
        decipher.setAuthTag(authenticationTag);

        return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    }

    private createAesKey(secretKey: string): Buffer {
        return crypto.createHash('sha256').update(secretKey).digest();
    }
}
