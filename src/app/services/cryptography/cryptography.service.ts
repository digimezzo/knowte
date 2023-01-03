import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class CryptographyService {
    public encrypt(text: string, secretKey: string): string {
        const encryptedText: string = CryptoJS.AES.encrypt(text, secretKey).toString();

        return encryptedText;
    }

    public decrypt(text: string, secretKey: string): string {
        const decryptedText: string = CryptoJS.AES.decrypt(text, secretKey).toString(CryptoJS.enc.Utf8);

        return decryptedText;
    }
}
