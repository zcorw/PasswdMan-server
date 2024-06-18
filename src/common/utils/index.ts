import dayjs from 'dayjs';
import crypto from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';

export function now() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

export function hashPassword(
  password: string,
  salt?: string,
): Promise<{ hashedPassword: string; salt: string }> {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex'); // 生成随机的盐值
  }
  const iterations = 1000; // 迭代次数，可以根据需求调整
  const keylen = 128; // 生成的哈希值长度，可以根据需求调整

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keylen,
      'sha512',
      (err, derivedKey) => {
        if (err) reject(err);
        const hashedPassword = derivedKey.toString('hex');
        resolve({ hashedPassword, salt });
      },
    );
  });
}

export function GenerateUUID(): string {
  const uuid = uuidv4();
  return uuid.replaceAll('-', '');
}
