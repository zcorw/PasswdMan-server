import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SkipAuth } from 'src/common/decorators/SkipAuthDecorator';
import * as fs from 'fs';
import { parse } from 'fast-csv';
import { PasswordService } from './password.service';
import { PasswordEntity } from './entities/password.entity';
import { GetUser } from 'src/common/decorators/GetUserDecorator';
import { CreatePasswordDto, UpdatePasswordDto } from './dto';
import { ResultData } from 'src/common/result';

type bitwardenType = {
  folder: string;
  type: string;
  name: string;
  note: string;
  fields: string;
  login_uri: string;
  login_username: string;
  login_password: string;
};
@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  // 接收一个csv文件
  @Post('import')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // 上传文件的存储路径
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async import(@UploadedFile() file: Express.Multer.File) {
    const results: bitwardenType[] = [];
    const userId = 1;

    fs.createReadStream(file.path)
      .pipe(parse({ headers: true }))
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', async () => {
        // 筛选出所有folder字段的值
        const folders = results.reduce<string[]>((res, next) => {
          next.folder = next.folder ? next.folder : '默认群组';
          if (!res.includes(next.folder)) {
            res.push(next.folder);
          }
          return res;
        }, []);
        const groups = await this.passwordService.batchCreateGroup(
          userId,
          folders,
        );
        const passwords: CreatePasswordDto[] = results
          .map<CreatePasswordDto | null>((item) => {
            if (item.type === 'login') {
              const group = groups.find((group) => group.title === item.folder);
              if (!group) {
                return null;
              }
              return {
                name: item.name,
                uri: item.login_uri,
                username: item.login_username,
                password: item.login_password,
                remark: item.note,
                fields: item.fields,
                groupId: group.id,
              };
            } else {
              return null;
            }
          })
          .reduce((res, next) => (next ? res.concat([next]) : res), []);
        // 这里可以进一步处理 CSV 数据
        await this.passwordService.batchCreate(userId, passwords);
        fs.unlinkSync(file.path);
      });

    return ResultData.ok(null, '导入成功');
  }
  // 获取所有密码
  @Get('list')
  @HttpCode(200)
  async list(@GetUser() user: any) {
    const res = await this.passwordService.findAll(user.user.userId);
    return ResultData.ok(res);
  }
}
