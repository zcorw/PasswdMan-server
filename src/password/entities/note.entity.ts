import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { GroupEntity } from './group.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';

@Entity('note', {
  comment: '笔记表',
})
export class NoteEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'note_id',
    comment: '笔记ID',
  })
  public nId: number;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
    name: 'name',
    comment: '项目名称',
  })
  public name: string;

  @Column({
    type: 'text',
    nullable: false,
    name: 'note',
    comment: '笔记内容',
  })
  public note: string;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: true,
    name: 'uri',
    comment: '项目地址',
  })
  public uri: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'remark',
    comment: '备注',
  })
  public remark: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'fields',
    comment: '字段',
  })
  public fields: string;

  @ManyToOne(() => GroupEntity, (group) => group.notes)
  group: GroupEntity;

  @ManyToOne(() => UserEntity, (user) => user.groups)
  public user: UserEntity;
}
