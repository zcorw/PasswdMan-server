import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  Query,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { parse } from 'fast-csv';
import { PasswordService } from './password.service';
import { GetUser } from 'src/common/decorators/GetUserDecorator';
import { CreatePasswordDto, FindPasswordByIdDto } from './dto';
import { ResultData } from 'src/common/result';
import { CryptoService } from './crypto.service';
import { FormValidationPipe } from 'src/common/pipes/FormValidationPipe';

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
  constructor(
    private readonly passwordService: PasswordService,
    private readonly crypto: CryptoService,
  ) {}

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
  async import(
    @GetUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const results: bitwardenType[] = [];
    const userId = user.user.userId;

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
  async list(@GetUser() user: any, @Query() data: FindPasswordByIdDto) {
    const res = await this.passwordService.findPwdAfterId(
      user.user.userId,
      data,
    );
    return ResultData.pageData(
      res.data.map((item) => ({
        ...item,
        password: this.crypto.decrypt(item.password),
      })),
      res.total,
    );
  }

  // 获取群组列表
  @Get('groups')
  @HttpCode(200)
  async groups(@GetUser() user: any) {
    const res = await this.passwordService.getGroups(user.user.userId);
    return ResultData.ok(res);
  }
  // 添加密码
  @Post('add')
  @HttpCode(200)
  async add(
    @GetUser() user: any,
    @Body(FormValidationPipe) data: CreatePasswordDto,
  ) {
    const res = await this.passwordService.create(user.user.userId, data);
    return ResultData.ok(res);
  }
}
