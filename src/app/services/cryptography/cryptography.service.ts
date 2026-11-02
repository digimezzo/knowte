import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as crypto from 'crypto';

interface DerivedKey {
    password: string;
    salt: Buffer;
    key: Buffer;
}

/**
 * Current format: scrypt-derived key + AES-256-GCM, laid out as salt | iv | tag | ciphertext.
 * Legacy formats (CryptoJS passphrase AES for text, SHA-256 keyed AES-GCM for buffers) can only be decrypted.
 */
@Injectable()
export class CryptographyService {
    private static readonly legacyInitializationVectorLength: number = 16;
    private static readonly authenticationTagLength: number = 16;
    private static readonly initializationVectorLength: number = 12;
    private static readonly saltLength: number = 16;
    private static readonly keyLength: number = 32;
    private static readonly textFormatPrefix: string = 'knowte-enc-v2:';
    private static readonly bufferFormatMarker: Buffer = Buffer.from('KNOWTE-ENC-V2\0', 'latin1');
    // OWASP minimum scrypt cost (N=2^17, r=8, p=1); needs 128 MiB.
    private static readonly scryptOptions = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
    private static readonly maximumCachedKeys: number = 8;

    // Deriving a key is deliberately slow, so keys are kept in memory per password and salt.
    private derivedKeys: DerivedKey[] = [];

    public encrypt(text: string, secretKey: string): string {
        const payload: Buffer = this.encryptWithCurrentFormat(Buffer.from(text, 'utf8'), secretKey);

        return CryptographyService.textFormatPrefix + payload.toString('base64');
    }

    public decrypt(text: string, secretKey: string): string {
        if (this.isCurrentTextFormat(text)) {
            const payload: Buffer = Buffer.from(text.substring(CryptographyService.textFormatPrefix.length), 'base64');

            return this.decryptWithCurrentFormat(payload, secretKey).toString('utf8');
        }

        return CryptoJS.AES.decrypt(text, secretKey).toString(CryptoJS.enc.Utf8);
    }

    public isCurrentTextFormat(text: string): boolean {
        return text.startsWith(CryptographyService.textFormatPrefix);
    }

    public isCurrentBufferFormat(buffer: Buffer): boolean {
        const marker: Buffer = CryptographyService.bufferFormatMarker;

        return buffer.length >= marker.length && buffer.subarray(0, marker.length).equals(marker);
    }

    // Only used to verify the password of notes that still use the legacy format.
    public createHash(text: string): string {
        return CryptoJS.SHA256(text).toString();
    }

    public encryptBuffer(buffer: Buffer, secretKey: string): Buffer {
        return Buffer.concat([CryptographyService.bufferFormatMarker, this.encryptWithCurrentFormat(buffer, secretKey)]);
    }

    public decryptBuffer(buffer: Buffer, secretKey: string): Buffer {
        if (this.isCurrentBufferFormat(buffer)) {
            return this.decryptWithCurrentFormat(buffer.subarray(CryptographyService.bufferFormatMarker.length), secretKey);
        }

        return this.decryptLegacyBuffer(buffer, secretKey);
    }

    private encryptWithCurrentFormat(plainBuffer: Buffer, secretKey: string): Buffer {
        const { salt, key } = this.getKeyForEncryption(secretKey);
        const initializationVector: Buffer = crypto.randomBytes(CryptographyService.initializationVectorLength);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, initializationVector);

        const encryptedBuffer: Buffer = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);

        return Buffer.concat([salt, initializationVector, cipher.getAuthTag(), encryptedBuffer]);
    }

    private decryptWithCurrentFormat(payload: Buffer, secretKey: string): Buffer {
        const saltEnd: number = CryptographyService.saltLength;
        const initializationVectorEnd: number = saltEnd + CryptographyService.initializationVectorLength;
        const authenticationTagEnd: number = initializationVectorEnd + CryptographyService.authenticationTagLength;

        if (payload.length < authenticationTagEnd) {
            throw new Error('Encrypted data is truncated.');
        }

        const salt: Buffer = payload.subarray(0, saltEnd);
        const initializationVector: Buffer = payload.subarray(saltEnd, initializationVectorEnd);
        const authenticationTag: Buffer = payload.subarray(initializationVectorEnd, authenticationTagEnd);
        const encryptedBuffer: Buffer = payload.subarray(authenticationTagEnd);

        const decipher = crypto.createDecipheriv('aes-256-gcm', this.getKey(secretKey, salt), initializationVector);
        decipher.setAuthTag(authenticationTag);

        return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    }

    private getKeyForEncryption(secretKey: string): DerivedKey {
        const cachedKey: DerivedKey | undefined = this.derivedKeys.find((x) => x.password === secretKey);

        if (cachedKey) {
            return cachedKey;
        }

        return this.getKeyEntry(secretKey, crypto.randomBytes(CryptographyService.saltLength));
    }

    private getKey(secretKey: string, salt: Buffer): Buffer {
        return this.getKeyEntry(secretKey, salt).key;
    }

    private getKeyEntry(secretKey: string, salt: Buffer): DerivedKey {
        const cachedKey: DerivedKey | undefined = this.derivedKeys.find((x) => x.password === secretKey && x.salt.equals(salt));

        if (cachedKey) {
            return cachedKey;
        }

        const key: Buffer = crypto.scryptSync(
            secretKey.normalize('NFKC'),
            salt,
            CryptographyService.keyLength,
            CryptographyService.scryptOptions,
        );
        const entry: DerivedKey = { password: secretKey, salt: Buffer.from(salt), key };

        this.derivedKeys.push(entry);

        if (this.derivedKeys.length > CryptographyService.maximumCachedKeys) {
            this.derivedKeys.shift();
        }

        return entry;
    }

    private decryptLegacyBuffer(buffer: Buffer, secretKey: string): Buffer {
        const key: Buffer = crypto.createHash('sha256').update(secretKey).digest();
        const initializationVectorEnd: number = CryptographyService.legacyInitializationVectorLength;
        const initializationVector: Buffer = buffer.subarray(0, initializationVectorEnd);
        const authenticationTag: Buffer = buffer.subarray(
            initializationVectorEnd,
            initializationVectorEnd + CryptographyService.authenticationTagLength,
        );
        const encryptedBuffer: Buffer = buffer.subarray(initializationVectorEnd + CryptographyService.authenticationTagLength);

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, initializationVector);
        decipher.setAuthTag(authenticationTag);

        return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    }
}
