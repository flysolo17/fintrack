import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment.development';
@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  constructor() {}

  encrypt(password: string): string {
    return CryptoJS.AES.encrypt(password, environment.projectId).toString();
  }

  decrypt(encryptedPassword: string): string {
    const bytes = CryptoJS.AES.decrypt(
      encryptedPassword,
      environment.projectId
    );
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
