import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { SKIP_AUTH } from '../constants/decorators';

import { UserService } from 'src/user/user/user.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    @Inject(UserService)
    private readonly userService: UserService,
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
    const accessToken = req.get('Authorization');
    if (!accessToken) throw new ForbiddenException('请重新登录');
    const atUserId = await this.userService.parseToken(accessToken);
    if (!atUserId)
      throw new UnauthorizedException('当前登录已过期，请重新登录');
    return await this.activate(ctx);
  }

  async activate(ctx: ExecutionContext): Promise<boolean> {
    return super.canActivate(ctx) as Promise<boolean>;
  }
}
