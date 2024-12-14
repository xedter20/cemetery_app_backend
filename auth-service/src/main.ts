import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  console.log('jhammsmmss');
  app.useLogger(app.get(Logger));
  const port = process.env.PORT || 3000;

  console.log(`auth - ${port}`);
  await app.listen(port, '0.0.0.0');
  Logger.log(`Application is running onssss: ${await app.getUrl()}`);
}
bootstrap();
