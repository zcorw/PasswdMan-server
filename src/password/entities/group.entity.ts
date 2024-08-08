import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  Unique,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { PasswordEntity } from './password.entity';
import { NoteEntity } from './note.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';

@Entity('group', {
  comment: '群组表',
})
@Unique(['title', 'user'])
export class GroupEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'group_id',
    comment: '聚合组ID',
  })
  public id: number;

  @Column({
    type: 'varchar',
    name: 'title',
    length: 100,
    comment: '群组标题',
  })
  public title: string;

  @OneToMany(() => PasswordEntity, (passwd) => passwd.group)
  public passwords: PasswordEntity[];

  @OneToMany(() => NoteEntity, (passwd) => passwd.group)
  public notes: NoteEntity[];

  @ManyToOne(() => UserEntity, (user) => user.groups)
  public user: UserEntity;
}
