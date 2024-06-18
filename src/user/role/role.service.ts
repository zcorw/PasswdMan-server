import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { RoleEnum } from 'src/common/enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  findOne(roleTag: RoleEntity['roleTag']) {
    return this.roleRepo.findOneBy({ roleTag });
  }

  findAdmin() {
    return this.findOne(RoleEnum.ADMIN);
  }

  findNormal() {
    return this.findOne(RoleEnum.NORMAL);
  }
}
