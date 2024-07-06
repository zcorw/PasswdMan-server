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
