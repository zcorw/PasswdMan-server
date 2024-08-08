import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEntity } from './entities/group.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

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
}
