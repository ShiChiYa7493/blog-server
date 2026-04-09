import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors();
  // Serve uploaded files statically
  app.useStaticAssets(join(process.cwd(), '..', '..', 'uploads'), { prefix: '/uploads/' });
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
