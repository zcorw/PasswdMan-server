import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordEntity } from './entities/password.entity';
import { GroupEntity } from './entities/group.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';
import { CreatePasswordDto, UpdatePasswordDto, FindPasswordDto } from './dto';
import { CryptoService } from './crypto.service';

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
    pageData: FindPasswordDto,
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

  // 用文本对项目名、用户名、uri模糊查询
  async findByText(
    userId: UserEntity['userId'],
    text: string,
  ): Promise<PasswordEntity[]> {
    return await this.passwdRepo
      .createQueryBuilder('password')
      .leftJoinAndSelect('password.user', 'user')
      .leftJoinAndSelect('password.group', 'group')
      .where(
        'password.name LIKE :text OR password.uri LIKE :text OR password.username LIKE :text',
        { text: `%${text}%` },
      )
      .andWhere('user.userId = :userId', { userId })
      .getMany();
  }

  // 获取群组列表
  async getGroups(userId: UserEntity['userId']): Promise<GroupEntity[]> {
    return await this.groupRepo.find({
      where: {
        user: { userId },
      },
    });
  }

  // 通过群组名获取群组
  async getGroupByName(
    userId: UserEntity['userId'],
    name: string,
  ): Promise<GroupEntity> {
    return await this.groupRepo.findOne({
      where: {
        user: { userId },
        title: name,
      },
    });
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
    const groups = await this.getGroups(userId);
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

  // 批量创建群组，如果群组已经存在，则忽略
  async batchCreateGroup(
    userId: UserEntity['userId'],
    groupNames: string[],
  ): Promise<GroupEntity[]> {
    const user = await this.userRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const existingGroups = await this.groupRepo
      .createQueryBuilder('group')
      .innerJoin('group.user', 'user')
      .where('user.user_id = :userId', { userId })
      .andWhere('group.title IN (:...groupNames)', { groupNames })
      .getMany();
    const existingGroupsMap = new Map(
      existingGroups.map((group) => [`${userId}-${group.title}`, group]),
    );

    const newGroups = groupNames.filter(
      (groupName) => !existingGroupsMap.has(`${userId}-${groupName}`),
    );
    const groupsArr = Array.from(existingGroupsMap.values());
    if (newGroups.length > 0) {
      const newGroupsEntity = await this.groupRepo.save(
        newGroups.map((groupName) => {
          return this.groupRepo.create({
            title: groupName,
            user,
          });
        }),
      );
      newGroupsEntity.forEach((entity) => {
        groupsArr.push(entity);
      });
    }
    return groupsArr;
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
    password: UpdatePasswordDto,
  ): Promise<PasswordEntity> {
    const existingPassword = await this.findOne(userId, pId);
    if (!existingPassword) {
      throw new BadRequestException('Password not found');
    }
    Object.assign(existingPassword, password);
    return await this.passwdRepo.save(existingPassword);
  }
}
