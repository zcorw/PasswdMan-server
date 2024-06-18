import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { RegisterDto, LoginDto } from './dto';
import { hashPassword, now, GenerateUUID } from 'src/common/utils';
import { CacheEnum, DelFlagEnum, StatusEnum } from 'src/common/enum';
import { ResultCode } from 'src/common/enum/code';
import { LOGIN_TOKEN_EXPIRESIN } from 'src/common/constants';
import { RoleService } from '../role/role.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    @Inject(RoleService)
    private readonly roleService: RoleService,
    @Inject(CACHE_MANAGER)
    private readonly cacheModule: Cache,
  ) {}
  async findOne(userId: UserEntity['userId']) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.userId = :userId', { userId })
      .getOne();
    return user;
  }
  /**
   * 验证密码
   */
  async verifyPassword(
    userId: UserEntity['userId'],
    password: string,
  ): Promise<boolean> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect(['password', 'salt'])
      .where('user.userId = :id', { id: userId })
      .getOne();
    const { hashedPassword } = await hashPassword(password, user.salt);
    return hashedPassword !== user.password;
  }
  /**
   * 生成令牌
   */
  createToken(payload: { uuid: string; userId: number }): string {
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }
  /**
   * 从令牌中获取数据声明
   */
  parseToken(token: string) {
    try {
      if (!token) return null;
      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      return payload;
    } catch (error) {
      return null;
    }
  }
  /**
   * 创建用户
   */
  async create(userInfo: RegisterDto): Promise<UserEntity> {
    const username = userInfo.username;
    const password = userInfo.password;
    const user = await this.userRepo.findOne({
      where: { username: userInfo.username },
      select: ['userId'],
    });
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const { hashedPassword, salt } = await hashPassword(password);
    const adminRole = await this.roleService.findAdmin();
    const res = await this.userRepo.save({
      username,
      password: hashedPassword,
      salt,
      loginDate: now(),
      roles: [adminRole],
    });
    return res;
  }
  /**
   * 登录用户
   */
  async login(
    userInfo: LoginDto,
  ): Promise<[ResultCode, string | { token: string }]> {
    const user = await this.userRepo.findOne({
      where: { username: userInfo.username, delFlag: DelFlagEnum.NOTDELETED },
      select: ['userId'],
    });
    if (!user) {
      return [ResultCode.USERNOTFOUND, 'User not found'];
    }
    const passwordPass = await this.verifyPassword(
      user.userId,
      userInfo.password,
    );
    if (!passwordPass) {
      return [ResultCode.USERPASSWORDERROR, 'Incorrect password'];
    }
    const userData = await this.findOne(user.userId);
    if (userData.status === StatusEnum.DISABLED) {
      return [ResultCode.USERDISABLE, 'User is disabled'];
    }
    const uuid = GenerateUUID();
    const token = this.createToken({ uuid: uuid, userId: user.userId });
    const cacheData = {
      loginTime: now(),
      token: uuid,
      user: userData,
      userId: userData.userId,
      username: userData.username,
    };
    this.cacheModule.set(
      `${CacheEnum.LOGIN_TOKEN_KEY}${uuid}`,
      cacheData,
      LOGIN_TOKEN_EXPIRESIN,
    );
    return [ResultCode.SUCCESS, { token }];
  }
}
