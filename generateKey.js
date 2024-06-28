const forge = require('node-forge');
const CryptoJS = require('crypto-js');
const fs = require('fs');

// 生成RSA密钥对
const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(2048);
fs.writeFileSync('privateKey.pem', forge.pki.privateKeyToPem(privateKey));
// 示例密钥和IV
const key = forge.random.getBytesSync(32); // 256位对称密钥
const iv = forge.random.getBytesSync(16); // 128位初始向量

// 使用公钥加密密钥和IV
const encryptedKey = publicKey.encrypt(key, 'RSA-OAEP', {
  md: forge.md.sha256.create(),
});
const encryptedIv = publicKey.encrypt(iv, 'RSA-OAEP', {
  md: forge.md.sha256.create(),
});

// 将加密后的密钥和IV转换为Base64以便存储
const encryptedKeyBase64 = forge.util.encode64(encryptedKey);
const encryptedIvBase64 = forge.util.encode64(encryptedIv);
fs.writeFileSync('key.txt', encryptedKeyBase64 + '\n' + encryptedIvBase64);
// 解密密钥和IV
const decryptedKey = privateKey.decrypt(
  forge.util.decode64(encryptedKeyBase64),
  'RSA-OAEP',
  {
    md: forge.md.sha256.create(),
  },
);
const decryptedIv = privateKey.decrypt(
  forge.util.decode64(encryptedIvBase64),
  'RSA-OAEP',
  {
    md: forge.md.sha256.create(),
  },
);

// AES加密函数
function encrypt(text) {
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(text),
    CryptoJS.enc.Hex.parse(forge.util.bytesToHex(decryptedKey)),
    {
      iv: CryptoJS.enc.Hex.parse(forge.util.bytesToHex(decryptedIv)),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  return encrypted.toString();
}

// AES解密函数
function decrypt(encryptedText) {
  const decrypted = CryptoJS.AES.decrypt(
    encryptedText,
    CryptoJS.enc.Hex.parse(forge.util.bytesToHex(decryptedKey)),
    {
      iv: CryptoJS.enc.Hex.parse(forge.util.bytesToHex(decryptedIv)),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  return CryptoJS.enc.Utf8.stringify(decrypted);
}

// 示例数据
const data = 'Hello, world!';

// AES加密数据
const encryptedData = encrypt(data);
console.log('Encrypted Data:', encryptedData);

// AES解密数据
const decryptedData = decrypt(encryptedData);
console.log('Decrypted Data:', decryptedData);
