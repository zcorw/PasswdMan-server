import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordEntity } from './entities/password.entity';
import { GroupEntity } from './entities/group.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';
import { CreatePasswordDto, UpdatePasswordDto } from './dto';
import { FindByIdDto, FindByPageDto, OneByIdDto } from './dto/page';
import { CryptoService } from './crypto.service';
import { GroupService } from './group.service';

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(PasswordEntity)
    private readonly passwdRepo: Repository<PasswordEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,
    private readonly crypto: CryptoService,
    private readonly group: GroupService,
  ) {}
  // 根据用户ID和密码ID获取密码
  async findOne(
    userId: UserEntity['userId'],
    pId: PasswordEntity['pId'],
  ): Promise<PasswordEntity> {
    return await this.passwdRepo.findOne({
      where: {
        pId,
        user: { userId },
      },
      relations: ['user', 'group'],
    });
  }

  // 根据用户ID获取密码
  async findAll(
    userId: UserEntity['userId'],
    pageData: FindByPageDto,
  ): Promise<{ data: PasswordEntity[]; total: number }> {
    const [result, total] = await this.passwdRepo.findAndCount({
      where: {
        user: { userId },
      },
      skip: (pageData.page - 1) * pageData.limit,
      take: pageData.limit,
    });

    return {
      data: result,
      total,
    };
  }

  // 根据用户ID和群组ID获取密码
  async findByGroup(
    userId: UserEntity['userId'],
    groupId: GroupEntity['id'],
  ): Promise<PasswordEntity[]> {
    return await this.passwdRepo.find({
      where: {
        user: { userId },
        group: { id: groupId },
      },
      relations: ['user', 'group'],
    });
  }

  private buildPasswordQuery(
    userId: UserEntity['userId'],
    { id, groupId }: Pick<FindByIdDto, 'id' | 'groupId'>,
  ) {
    const query = this.passwdRepo.createQueryBuilder('password');
    query.where('password.userUserId = :userId', { userId });
    if (id) {
      query.andWhere('password.password_id < :pId', { pId: id });
    }
    if (groupId) {
      query.andWhere('password.groupId = :groupId', { groupId });
    }
    return query;
  }

  async findPwdAfterId(
    userId: UserEntity['userId'],
    { id, limit, groupId, text }: FindByIdDto,
  ) {
    const query = this.buildPasswordQuery(userId, { id, groupId });
    if (text) {
      query.andWhere(
        'LOWER(password.name) LIKE LOWER(:text) OR LOWER(password.uri) LIKE LOWER(:text) OR LOWER(password.username) LIKE LOWER(:text)',
        { text: `%${text}%` },
      );
    }
    const [items, count] = await query
      .orderBy('password.password_id', 'DESC')
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      total: count,
    };
  }

  async findPwdById(userId: UserEntity['userId'], { id }: OneByIdDto) {
    const query = this.passwdRepo.createQueryBuilder('password');
    query
      .where('password.userUserId = :userId', { userId })
      .andWhere('password.password_id = :pId', { pId: id });
    const passwd = await query.addSelect('password.password').getOne();
    if (!passwd) {
      throw new UnauthorizedException(
        'You do not have access to this password',
      );
    }
    return this.crypto.decrypt(passwd.password);
  }

  // 创建密码
  async create(
    userId: UserEntity['userId'],
    password: CreatePasswordDto,
  ): Promise<PasswordEntity> {
    const user = await this.userRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const group = await this.groupRepo.findOne({
      where: { id: password.groupId },
    });
    if (!group) {
      throw new BadRequestException('Group not found');
    }
    password.password = this.crypto.encrypt(password.password);
    const newPassword = this.passwdRepo.create({
      ...password,
      user,
      group,
    });
    return await this.passwdRepo.save(newPassword);
  }

  // 批量创建密码
  async batchCreate(
    userId: UserEntity['userId'],
    passwords: CreatePasswordDto[],
  ): Promise<PasswordEntity[]> {
    const user = await this.userRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const groups = await this.group.getGroups(userId);
    const groupsMap = new Map(groups.map((group) => [group.id, group]));
    const newPasswords = passwords.map((password) => {
      const group = groupsMap.get(password.groupId);
      password.password = this.crypto.encrypt(password.password);
      return this.passwdRepo.create({
        ...password,
        user,
        group,
      });
    });
    return await this.passwdRepo.save(newPasswords);
  }

  // 创建群组
  async createGroup(
    userId: UserEntity['userId'],
    groupName: string,
  ): Promise<GroupEntity> {
    const user = await this.userRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // 过滤同名群组
    const group = await this.groupRepo.findOne({
      where: { user, title: groupName },
    });
    if (group) {
      throw new BadRequestException('Group already exists');
    }
    const newGroup = this.groupRepo.create({
      title: groupName,
      user,
    });
    return await this.groupRepo.save(newGroup);
  }

  // 删除密码
  async delete(
    userId: UserEntity['userId'],
    pId: PasswordEntity['pId'],
  ): Promise<void> {
    const password = await this.findOne(userId, pId);
    if (!password) {
      throw new BadRequestException('Password not found');
    }
    await this.passwdRepo.remove(password);
  }

  // 更新密码
  async update(
    userId: UserEntity['userId'],
    pId: PasswordEntity['pId'],
    passwordData: UpdatePasswordDto,
  ): Promise<PasswordEntity> {
    const existingPassword = await this.findOne(userId, pId);
    if (!existingPassword) {
      throw new BadRequestException('Password not found');
    }
    if (passwordData.password) {
      passwordData.password = this.crypto.encrypt(passwordData.password);
    }
    Object.assign(existingPassword, passwordData);
    return await this.passwdRepo.save(existingPassword);
  }
}
