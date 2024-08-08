import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  Query,
  Body,
  Param,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { parse } from 'fast-csv';
import { NoteService } from './note.service';
import { GetUser } from 'src/common/decorators/GetUserDecorator';
import { CreateNoteDto, OneByIdDto, UpdateNoteDto } from './dto/note';
import { FindByIdDto } from './dto/page';
import { ResultData } from 'src/common/result';
import { FormValidationPipe } from 'src/common/pipes/FormValidationPipe';
import type { bitwardenType } from 'src/types/importFile';
import { GroupService } from './group.service';

@Controller('note')
export class NoteController {
  constructor(
    private readonly noteService: NoteService,
    private readonly groupService: GroupService,
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
    const promise = new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(parse({ headers: true }))
        .on('data', (row) => {
          results.push(row);
        })
        .on('error', (error) => {
          console.error('Error while parsing:', error);
          reject(new Error('导入失败'));
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
          const groups = await this.groupService.batchCreateGroup(
            userId,
            folders,
          );
          const notes: CreateNoteDto[] = results
            .map<CreateNoteDto | null>((item) => {
              if (item.type === 'note') {
                const group = groups.find(
                  (group) => group.title === item.folder,
                );
                if (!group) {
                  return null;
                }
                return {
                  name: item.name,
                  uri: item.login_uri,
                  note: item.notes,
                  remark: '',
                  fields: item.fields,
                  groupId: group.id,
                };
              } else {
                return null;
              }
            })
            .reduce((res, next) => (next ? res.concat([next]) : res), []);
          // 这里可以进一步处理 CSV 数据
          await this.noteService.batchCreate(userId, notes);
          fs.unlinkSync(file.path);
          resolve('导入成功');
        });
    });
    return promise
      .then((message: string) => {
        return ResultData.ok(null, message);
      })
      .catch((error: Error) => {
        throw new HttpException(error.message, 500);
      });
  }
  // 获取所有密码
  @Get('list')
  @HttpCode(200)
  async list(@GetUser() user: any, @Query() data: FindByIdDto) {
    const res = await this.noteService.findAfterId(user.user.userId, data);
    return ResultData.pageData(res.data, res.total);
  }

  // 添加笔记
  @Post('add')
  @HttpCode(200)
  async add(
    @GetUser() user: any,
    @Body(FormValidationPipe) data: CreateNoteDto,
  ) {
    const res = await this.noteService.create(user.user.userId, data);
    return ResultData.ok(res);
  }
  // 根据id获取密码
  @Get('find')
  @HttpCode(200)
  async find(@GetUser() user: any, @Query() data: OneByIdDto) {
    const password = await this.noteService.findPwdById(user.user.userId, data);
    return ResultData.ok(password);
  }
  // 修改密码
  @Put('update/:id')
  @HttpCode(200)
  async update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body(FormValidationPipe) data: UpdateNoteDto,
  ) {
    if (id === '') {
      throw new BadRequestException('id不能为空');
    }
    const res = await this.noteService.update(user.user.userId, +id, data);
    return ResultData.ok(res);
  }
  // 删除密码
  @Delete('delete/:id')
  @HttpCode(200)
  async delete(@GetUser() user: any, @Param('id') id: string) {
    if (id === '') {
      throw new BadRequestException('id不能为空');
    }
    const res = await this.noteService.delete(user.user.userId, +id);
    return ResultData.ok(res);
  }
}
