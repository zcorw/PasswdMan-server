import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('role', {
  comment: '角色表',
})
export class RoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'role_id',
    comment: '角色ID',
  })
  public userId: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'role_tag',
    comment: '角色标识',
    nullable: false,
  })
  public roleTag: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'role_name',
    comment: '角色名',
    nullable: false,
  })
  public roleName: string;
}
