import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SKIP_AUTH } from '../constants/decorators';
import { UserService } from 'src/user/user/user.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    @Inject(UserService)
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const allowAnon = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (allowAnon) return true;
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();
    const accessToken = req.get('Authorization');
    if (!accessToken) throw new ForbiddenException('请重新登录');
    const payload = await this.userService.parseToken(accessToken);
    if (!payload) throw new UnauthorizedException('当前登录已过期，请重新登录');
    const now = Math.floor(Date.now() / 1000);
    // 剩余有效时长
    const leftTime = payload.exp - now;
    if (leftTime <= 60) {
      const newToken = this.userService.createToken({
        uuid: payload.uuid,
        userId: payload.userId,
      });
      res.setHeader('x-new-token', newToken); // 将新令牌添加到响应头中
    }
    return await this.activate(ctx);
  }

  async activate(ctx: ExecutionContext): Promise<boolean> {
    return super.canActivate(ctx) as Promise<boolean>;
  }
}
