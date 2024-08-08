import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { CryptoService } from './crypto.service';
import { GroupService } from './group.service';
import { NoteService } from './note.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PasswordEntity } from './entities/password.entity';
import { UserEntity } from 'src/user/user/entities/user.entity';
import { GroupEntity } from 'src/password/entities/group.entity';
import { NoteEntity } from 'src/password/entities/note.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PasswordEntity,
      UserEntity,
      GroupEntity,
      NoteEntity,
    ]),
    ConfigModule,
  ],
  providers: [PasswordService, CryptoService, GroupService, NoteService],
  exports: [PasswordService, CryptoService, GroupService, NoteService],
})
export class PasswordModule {}
