import {
  Injectable,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class FileDownloadInterceptor implements NestInterceptor {
  constructor(
    private readonly fileName: string,
    private readonly mimeType: string,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 处理中文文件名，进行 URL 编码
    const encodedFileName = encodeURIComponent(this.fileName);

    // 设置文件下载的响应头
    response.set({
      'Content-Type': this.mimeType,
      'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
    });

    // 直接返回处理后的内容
    return next.handle().pipe(
      map((data) => {
        // 这里的 data 是控制器返回的内容，通常是文件数据或流
        return data;
      }),
    );
  }
}
