import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { GroupEntity } from './group.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';

@Entity('password', {
  comment: '密码表',
})
export class PasswordEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'password_id',
    comment: '密码ID',
  })
  public pId: number;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
    name: 'name',
    comment: '项目名称',
  })
  public name: string;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: true,
    name: 'uri',
    comment: '项目地址',
  })
  public uri: string;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: true,
    name: 'username',
    comment: '用户名',
  })
  public username: string;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
    name: 'password',
    comment: '密码',
  })
  public password: string;

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

  @ManyToOne(() => GroupEntity, (group) => group.passwords)
  group: GroupEntity;

  @ManyToOne(() => UserEntity, (user) => user.groups)
  public user: UserEntity;
}
