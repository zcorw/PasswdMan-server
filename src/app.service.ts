import { Injectable, Inject } from '@nestjs/common';
import { UserService } from './user/user/user.service';
import { ResultData } from 'src/common/result';
import { LoginDto, RegisterDto } from './user/user/dto';
import { ResultCode } from 'src/common/enum/code';

@Injectable()
export class AppService {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}
  async login(user: LoginDto): Promise<ResultData> {
    const res = await this.userService.login(user);
    if (ResultCode.SUCCESS === res[0]) {
      return ResultData.ok(res[1], 'Login Success');
    } else {
      return ResultData.fail(res[0], res[1] as string);
    }
  }

  async register(user: RegisterDto): Promise<ResultData> {
    const res = await this.userService.create(user);
    return ResultData.ok({ userId: res.userId }, 'Register Success');
  }
}
