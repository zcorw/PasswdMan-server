import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { UserService } from './user/user/user.service';
import { PasswordService } from 'src/password/password.service';
import { ResultData } from 'src/common/result';
import { EncryptLoginDto, LoginDto, RegisterDto } from './user/user/dto';
import { ResultCode } from 'src/common/enum/code';
import * as forge from 'node-forge';
import type { pki } from 'node-forge';
import { AesCryptoHelper } from 'src/common/utils/cryptoUtils';

@Injectable()
export class AppService {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(PasswordService)
    private readonly passwordService: PasswordService,
  ) {
    const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(2048);
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  private publicKey: pki.rsa.PublicKey;
  private privateKey: pki.rsa.PrivateKey;

  async login(data: EncryptLoginDto): Promise<ResultData> {
    let userInfo: LoginDto, aesKey: string;
    try {
      aesKey = this.decrypt(data.aesKey);
      userInfo = AesCryptoHelper.decryptWithSymmetricKey(
        data.encryptData.data,
        data.encryptData.iv,
        data.encryptData.sign,
        aesKey,
      ) as LoginDto;
    } catch (error) {
      throw new ForbiddenException('Invalid signature');
    }
    const res = await this.userService.login(userInfo, aesKey);
    if (ResultCode.SUCCESS === res[0]) {
      return ResultData.ok(res[1], 'Login Success');
    } else {
      return ResultData.fail(res[0], res[1] as string);
    }
  }

  async register(user: RegisterDto): Promise<ResultData> {
    const res = await this.userService.create(user);
    await this.passwordService.createGroup(res.userId, '默认群组');
    return ResultData.ok({ userId: res.userId }, 'Register Success');
  }

  getPublicKey(): ResultData {
    return ResultData.ok(
      forge.util.encode64(forge.pki.publicKeyToPem(this.publicKey)),
    );
  }

  sign(data: object): string {
    const md = forge.md.sha256.create();
    md.update(JSON.stringify(data), 'utf8');
    const signature = this.privateKey.sign(md, 'SHA256');
    return forge.util.encode64(signature);
  }

  verify(data: string, signature: string): boolean {
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return this.publicKey.verify(md.digest().bytes(), signature);
  }

  encrypt(data: string): string {
    const encrypted = this.publicKey.encrypt(data, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
    return forge.util.encode64(encrypted);
  }

  decrypt(data: string): string {
    const decrypted = this.privateKey.decrypt(
      forge.util.decode64(data),
      'RSA-OAEP',
      {
        md: forge.md.sha256.create(),
      },
    );
    return decrypted;
  }
}
