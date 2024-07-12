import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { CryptoService } from './crypto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PasswordEntity } from './entities/password.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';
import { GroupEntity } from 'src/password/entities/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordEntity, UserEntity, GroupEntity]),
    ConfigModule,
  ],
  providers: [PasswordService, CryptoService],
  exports: [PasswordService, CryptoService],
})
export class PasswordModule {}
