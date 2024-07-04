import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordEntity } from './entities/password.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';
import { GroupEntity } from 'src/password/entities/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordEntity, UserEntity, GroupEntity]),
  ],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}
