import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import { CryptographyService } from './cryptography.service';

jest.setTimeout(60000);

describe('CryptographyService', () => {
    const secretKey = 'correct horse battery staple';
    let service: CryptographyService;

    beforeEach(() => {
        service = new CryptographyService();
    });

    describe('text', () => {
        it('round-trips text in the current format without exposing the plaintext', () => {
            const encrypted = service.encrypt('{"ops":[{"insert":"secret"}]}', secretKey);

            expect(service.isCurrentTextFormat(encrypted)).toBe(true);
            expect(encrypted).not.toContain('secret');
            expect(service.decrypt(encrypted, secretKey)).toBe('{"ops":[{"insert":"secret"}]}');
        });

        it('round-trips non-ASCII text and passwords', () => {
            const encrypted = service.encrypt('héllo ✓', 'pässwörd€');

            expect(service.decrypt(encrypted, 'pässwörd€')).toBe('héllo ✓');
        });

        it('produces different output for the same input', () => {
            expect(service.encrypt('same', secretKey)).not.toBe(service.encrypt('same', secretKey));
        });

        it('rejects a wrong password', () => {
            const encrypted = service.encrypt('secret', secretKey);

            expect(() => service.decrypt(encrypted, 'wrong')).toThrow();
        });

        it('rejects tampered or truncated data', () => {
            const encrypted = service.encrypt('secret', secretKey);
            const payload = Buffer.from(encrypted.substring('knowte-enc-v2:'.length), 'base64');
            payload[payload.length - 1] ^= 1;

            expect(() => service.decrypt('knowte-enc-v2:' + payload.toString('base64'), secretKey)).toThrow();
            expect(() => service.decrypt('knowte-enc-v2:AAAA', secretKey)).toThrow();
        });

        it('still decrypts text encrypted by earlier versions', () => {
            const legacy = CryptoJS.AES.encrypt('legacy secret', secretKey).toString();

            expect(service.isCurrentTextFormat(legacy)).toBe(false);
            expect(service.decrypt(legacy, secretKey)).toBe('legacy secret');
        });

        it('does not use the SHA-256 hash of the password as key material', () => {
            const encrypted = service.encrypt('secret', secretKey);

            expect(() => service.decrypt(encrypted, service.createHash(secretKey))).toThrow();
        });
    });

    describe('buffers', () => {
        const content = Buffer.from([0, 1, 2, 3, 250, 251, 252, 253, 254, 255]);

        it('round-trips buffers in the current format', () => {
            const encrypted = service.encryptBuffer(content, secretKey);

            expect(service.isCurrentBufferFormat(encrypted)).toBe(true);
            expect(service.decryptBuffer(encrypted, secretKey).equals(content)).toBe(true);
        });

        it('rejects a wrong password and tampered data', () => {
            const encrypted = service.encryptBuffer(content, secretKey);
            const tampered = Buffer.from(encrypted);
            tampered[tampered.length - 1] ^= 1;

            expect(() => service.decryptBuffer(encrypted, 'wrong')).toThrow();
            expect(() => service.decryptBuffer(tampered, secretKey)).toThrow();
        });

        it('cannot be decrypted with a key derived from the stored hash of the password', () => {
            const encrypted = service.encryptBuffer(content, secretKey);
            const key = Buffer.from(service.createHash(secretKey), 'hex');
            const payload = encrypted.subarray(encrypted.length - content.length - 16 - 12 - 16);
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, payload.subarray(16, 28));
            decipher.setAuthTag(payload.subarray(28, 44));

            expect(() => Buffer.concat([decipher.update(payload.subarray(44)), decipher.final()])).toThrow();
        });

        it('still decrypts buffers encrypted by earlier versions', () => {
            const key = crypto.createHash('sha256').update(secretKey).digest();
            const initializationVector = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-gcm', key, initializationVector);
            const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
            const legacy = Buffer.concat([initializationVector, cipher.getAuthTag(), encrypted]);

            expect(service.isCurrentBufferFormat(legacy)).toBe(false);
            expect(service.decryptBuffer(legacy, secretKey).equals(content)).toBe(true);
        });
    });
});
