import * as forge from 'node-forge';
import CryptoJS from 'crypto-js';

let CRYPTO_KEY: string = '';
let CRYPTO_IV: string = '';

function decryptedKeyAndIv(): void {
  const key = process.env.CRYPTO_KEY;
  const iv = process.env.CRYPTO_IV;
  // 从环境变量中获取私钥
  const privateKeyPem = process.env.PRIVATE_KEY;

  // 将PEM格式的私钥转换为私钥对象
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  CRYPTO_KEY = privateKey.decrypt(forge.util.decode64(key), 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });
  CRYPTO_IV = privateKey.decrypt(forge.util.decode64(iv), 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });
}

export function encrypt(text) {
  if (!CRYPTO_KEY) {
    decryptedKeyAndIv();
  }
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(text),
    CryptoJS.enc.Hex.parse(forge.util.bytesToHex(CRYPTO_KEY)),
    {
      iv: CryptoJS.enc.Hex.parse(forge.util.bytesToHex(CRYPTO_IV)),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  return encrypted.toString();
}

export function decrypt(encryptedText) {
  if (!CRYPTO_KEY) {
    decryptedKeyAndIv();
  }
  const decrypted = CryptoJS.AES.decrypt(
    encryptedText,
    CryptoJS.enc.Hex.parse(forge.util.bytesToHex(CRYPTO_KEY)),
    {
      iv: CryptoJS.enc.Hex.parse(forge.util.bytesToHex(CRYPTO_IV)),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  return CryptoJS.enc.Utf8.stringify(decrypted);
}
