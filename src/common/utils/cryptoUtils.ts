import * as forge from 'node-forge';

export function generateKeyAndIv() {
  // 生成RSA密钥对
  const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(2048);
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

  // jwt密钥
  const bytes = forge.random.getBytesSync(32);
  const secret = forge.util.encode64(bytes);

  return {
    key: encryptedKeyBase64,
    iv: encryptedIvBase64,
    privateKey: forge.pki.privateKeyToPem(privateKey),
    jwtSecret: secret,
  };
}

export class AesCryptoHelper {
  // 对称加密
  static encryptWithSymmetricKey(
    data: object | unknown[],
    aesKey: string,
  ): {
    data: string;
    iv: string;
    sign: string;
    type: 'AES';
  } {
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    const iv = forge.random.getBytesSync(16); // 生成随机IV
    cipher.start({ iv });
    cipher.update(
      forge.util.createBuffer(forge.util.encodeUtf8(JSON.stringify(data))),
    );
    cipher.finish();
    return {
      data: forge.util.encode64(cipher.output.getBytes()),
      iv: forge.util.encode64(iv),
      sign: this.hmacSign(data, aesKey),
      type: 'AES',
    };
  }

  // 使用HMAC-SHA256对数据进行签名
  static hmacSign(data: object, aesKey: string): string {
    const hmac = forge.hmac.create();
    hmac.start('sha256', aesKey);
    hmac.update(JSON.stringify(data)); // 或者加密后的数据
    const hmacSignature = hmac.digest().toHex();
    return hmacSignature;
  }

  // 使用AES-CBC解密数据并验证签名
  static decryptWithSymmetricKey(
    data: string,
    iv: string,
    signature: string,
    aesKey: string,
  ): object {
    const cipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    cipher.start({ iv: forge.util.decode64(iv) });
    cipher.update(forge.util.createBuffer(forge.util.decode64(data)));
    cipher.finish();
    const decryptedData = JSON.parse(cipher.output.getBytes().toString());
    const hmacSignature = this.hmacSign(decryptedData, aesKey);
    if (hmacSignature !== signature) throw new Error('签名验证失败');
    return decryptedData;
  }
}
