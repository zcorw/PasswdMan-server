import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordEntity } from './entities/password.entity';
import { GroupEntity } from './entities/group.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';
import { CreatePasswordDto, UpdatePasswordDto } from './dto';

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(PasswordEntity)
    private readonly passwdRepo: Repository<PasswordEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,
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
  async findAll(userId: UserEntity['userId']): Promise<PasswordEntity[]> {
    return await this.passwdRepo.find({
      where: {
        user: { userId },
      },
      relations: ['user', 'group'],
    });
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

    const newPassword = this.passwdRepo.create({
      ...password,
      user,
    });
    return await this.passwdRepo.save(newPassword);
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
