import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { RoleEntity } from 'src/user/role/entities/role.entity';

@Entity('user', {
  comment: '用户表',
})
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_id',
    comment: '用户ID',
  })
  public userId: number;

  @Column({
    type: 'varchar',
    name: 'user_name',
    length: 30,
    nullable: false,
    unique: true,
    comment: '用户账号',
  })
  public username: string;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
    comment: '用户登录密码',
    select: false,
  })
  public password: string;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: false,
    comment: '加密盐值',
    select: false,
  })
  public salt: string;

  @Column({ type: 'timestamp', name: 'login_date', comment: '最后登录时间' })
  public loginDate: Date;

  @ManyToMany(() => RoleEntity)
  @JoinTable()
  public roles: RoleEntity[];
}
