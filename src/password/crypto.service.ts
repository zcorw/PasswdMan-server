import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as forge from 'node-forge';
import CryptoJS from 'crypto-js';

@Injectable()
export class CryptoService {
  crypt_key: string;
  crypt_iv: string;
  constructor(private readonly config: ConfigService) {
    // 从环境变量中获取私钥
    const privateKeyPem = this.config.get<string>('crypto.privateKey');
    const key = this.config.get<string>('crypto.key');
    const iv = this.config.get<string>('crypto.iv');
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    this.crypt_key = privateKey.decrypt(forge.util.decode64(key), 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
    this.crypt_iv = privateKey.decrypt(forge.util.decode64(iv), 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
  }

  encrypt(text: string): string {
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(text),
      CryptoJS.enc.Hex.parse(forge.util.bytesToHex(this.crypt_key)),
      {
        iv: CryptoJS.enc.Hex.parse(forge.util.bytesToHex(this.crypt_iv)),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    return encrypted.toString();
  }

  decrypt(encryptedText: string): string {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedText,
      CryptoJS.enc.Hex.parse(forge.util.bytesToHex(this.crypt_key)),
      {
        iv: CryptoJS.enc.Hex.parse(forge.util.bytesToHex(this.crypt_iv)),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    return CryptoJS.enc.Utf8.stringify(decrypted);
  }
}
