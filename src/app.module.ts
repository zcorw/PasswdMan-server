import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './user/auth/auth.module';
import { UserModule } from './user/user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RoleModule } from './user/role/role.module';
import configuration from './config/index';
import { UserEntity } from './user/user/entities/user.entity';
import { RoleEntity } from './user/role/entities/role.entity';
import { JwtAuthGuard } from './common/guards/AuthGuard';
import { PasswordController } from './password/password.controller';
import { NoteController } from './password/note.controller';
import { PasswordModule } from './password/password.module';

import { PasswordEntity } from './password/entities/password.entity';
import { GroupEntity } from './password/entities/group.entity';
import { NoteEntity } from './password/entities/note.entity';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      cache: true,
      load: [configuration],
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    // 数据库
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          entities: [`${__dirname}/**/*.entity{.ts,.js}`],
          autoLoadEntities: true,
          keepConnectionAlive: true,
          timezone: '+08:00',
          ...config.get('db.mysql'),
        } as TypeOrmModuleOptions;
      },
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      PasswordEntity,
      GroupEntity,
      NoteEntity,
    ]),
    AuthModule,
    UserModule,
    RoleModule,
    PasswordModule,
  ],
  controllers: [AppController, PasswordController, NoteController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
