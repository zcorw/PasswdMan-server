import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteEntity } from './entities/note.entity';
import { GroupEntity } from './entities/group.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';
import {
  CreateNoteDto,
  UpdateNoteDto,
  FindByPageDto,
  OneByIdDto,
} from './dto/note';
import { FindByIdDto } from './dto/page';
import { CryptoService } from './crypto.service';
import { GroupService } from './group.service';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepo: Repository<NoteEntity>,
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
    nId: NoteEntity['nId'],
  ): Promise<NoteEntity> {
    return await this.noteRepo.findOne({
      where: {
        nId,
        user: { userId },
      },
      relations: ['user', 'group'],
    });
  }

  // 根据用户ID获取密码
  async findAll(
    userId: UserEntity['userId'],
    pageData: FindByPageDto,
  ): Promise<{ data: NoteEntity[]; total: number }> {
    const [result, total] = await this.noteRepo.findAndCount({
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
  ): Promise<NoteEntity[]> {
    return await this.noteRepo.find({
      where: {
        user: { userId },
        group: { id: groupId },
      },
      relations: ['user', 'group'],
    });
  }

  private buildNoteQuery(
    userId: UserEntity['userId'],
    { id, groupId }: Pick<FindByIdDto, 'id' | 'groupId'>,
  ) {
    const query = this.noteRepo.createQueryBuilder('note');
    query.where('note.userUserId = :userId', { userId });
    if (id) {
      query.andWhere('note.note_id < :nId', { nId: id });
    }
    if (groupId) {
      query.andWhere('note.groupId = :groupId', { groupId });
    }
    return query;
  }

  async findAfterId(
    userId: UserEntity['userId'],
    { id, limit, groupId, text }: FindByIdDto,
  ) {
    const query = this.buildNoteQuery(userId, { id, groupId });
    if (text) {
      query.andWhere(
        'LOWER(note.name) LIKE LOWER(:text) OR LOWER(note.uri) LIKE LOWER(:text)',
        { text: `%${text}%` },
      );
    }
    const [items, count] = await query
      .orderBy('note.note_id', 'DESC')
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      total: count,
    };
  }

  async findPwdById(userId: UserEntity['userId'], { id }: OneByIdDto) {
    const query = this.noteRepo.createQueryBuilder('note');
    query
      .where('note.userUserId = :userId', { userId })
      .andWhere('note.note_id = :nId', { nId: id });
    const note = await query.addSelect('note.note').getOne();
    if (!note) {
      throw new UnauthorizedException('You do not have access to this note');
    }
    return this.crypto.decrypt(note.note);
  }

  // 创建笔记
  async create(
    userId: UserEntity['userId'],
    note: CreateNoteDto,
  ): Promise<NoteEntity> {
    const user = await this.userRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const group = await this.groupRepo.findOne({
      where: { id: note.groupId },
    });
    if (!group) {
      throw new BadRequestException('Group not found');
    }
    note.note = this.crypto.encrypt(note.note);
    const newNote = this.noteRepo.create({
      ...note,
      user,
      group,
    });
    return await this.noteRepo.save(newNote);
  }

  // 批量创建笔记
  async batchCreate(
    userId: UserEntity['userId'],
    passwords: CreateNoteDto[],
  ): Promise<NoteEntity[]> {
    const user = await this.userRepo.findOne({
      where: { userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const groups = await this.group.getGroups(userId);
    const groupsMap = new Map(groups.map((group) => [group.id, group]));
    const newPasswords = passwords.map((note) => {
      const group = groupsMap.get(note.groupId);
      note.note = this.crypto.encrypt(note.note);
      return this.noteRepo.create({
        ...note,
        user,
        group,
      });
    });
    return await this.noteRepo.save(newPasswords);
  }

  // 删除密码
  async delete(
    userId: UserEntity['userId'],
    pId: NoteEntity['nId'],
  ): Promise<void> {
    const note = await this.findOne(userId, pId);
    if (!note) {
      throw new BadRequestException('Note not found');
    }
    await this.noteRepo.remove(note);
  }

  // 更新密码
  async update(
    userId: UserEntity['userId'],
    pId: NoteEntity['nId'],
    noteData: UpdateNoteDto,
  ): Promise<NoteEntity> {
    const existingNote = await this.findOne(userId, pId);
    if (!existingNote) {
      throw new BadRequestException('Note not found');
    }
    if (noteData.note) {
      noteData.note = this.crypto.encrypt(noteData.note);
    }
    Object.assign(existingNote, noteData);
    return await this.noteRepo.save(existingNote);
  }
}
