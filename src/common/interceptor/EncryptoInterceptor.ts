import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResultCode } from 'src/common/enum/code';
import { AesCryptoHelper } from 'src/common/utils/cryptoUtils';

@Injectable()
export class EncryptoInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        if (data.code !== ResultCode.SUCCESS) {
          return data;
        }
        const encryptData = AesCryptoHelper.encryptWithSymmetricKey(
          data.data,
          request.user.aesKey,
        );
        const { type, ..._data } = encryptData;
        response.setHeader('pa-encrypt', type); // 设置响应头
        return {
          ...data,
          data: _data,
        };
      }),
    );
  }
}
