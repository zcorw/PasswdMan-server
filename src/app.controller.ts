import { Body, Controller, HttpCode, Post, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EncryptLoginDto, RegisterDto } from './user/user/dto';
import { ResultData } from 'src/common/result';
import { SkipAuth } from 'src/common/decorators/SkipAuthDecorator';
import { ConfigService } from '@nestjs/config';
import { ResultCode } from 'src/common/enum/code';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/login')
  @HttpCode(200)
  @SkipAuth()
  login(@Body() data: EncryptLoginDto): Promise<ResultData> {
    return this.appService.login(data);
  }

  @Post('/register')
  @HttpCode(200)
  @SkipAuth()
  register(@Body() user: RegisterDto): Promise<ResultData> {
    const enableRegister = this.configService.get('user.enableRegister');
    if (!enableRegister) {
      return Promise.resolve(
        ResultData.fail(
          ResultCode.REGISTERISDISABLE,
          'Register is not allowed',
        ),
      );
    }
    return this.appService.register(user);
  }

  @Get('/authConfig')
  @HttpCode(200)
  @SkipAuth()
  authConfig(): ResultData {
    const enableRegister = this.configService.get('user.enableRegister');
    return ResultData.ok({ enableRegister });
  }

  @Get('/publicKey')
  @HttpCode(200)
  @SkipAuth()
  publicKey(): ResultData {
    return this.appService.getPublicKey();
  }
}
