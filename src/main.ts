import { NestFactory } from '@nestjs/core';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { FormValidationPipe } from 'src/common/pipes/FormValidationPipe';
import { HttpExceptionFilter } from 'src/common/filters/HttpExceptionFilter';
import { ConfigService } from '@nestjs/config';
import { ExceptionsFilter } from './common/filters/ExceptionsFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const config = app.get(ConfigService);

  // 设置访问频率
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 10000, // 限制15分钟内最多只能访问1000次
    }),
  );

  // 设置 api 访问前缀
  const prefix = config.get<string>('app.prefix');
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(new FormValidationPipe());
  app.useGlobalFilters(new ExceptionsFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  // web 安全，防常见漏洞
  // 注意： 开发环境如果开启 nest static module 需要将 crossOriginResourcePolicy 设置为 false 否则 静态资源 跨域不可访问
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: false,
    }),
  );

  //服务端口
  const port = config.get<number>('app.port') || 8080;
  await app.listen(port);
}
bootstrap();
