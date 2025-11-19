import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ValidationException } from './common/exceptions/validation.exception';
import { mapValidationErrors } from './common/utils/validation.mapper';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';
import { ErrorHandlerInterceptor } from './common/interceptors/error-handler.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
async function bootstrap() {
  // const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use('/order/webhook',express.raw({ type: 'application/json' }));
  app.set("query parser", "extended");
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => {
      const payload = mapValidationErrors(errors);
      return new ValidationException(payload);
    },
  }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new SuccessResponseInterceptor(), new ErrorHandlerInterceptor());
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>('PORT', 3000)
  await app.listen(port);
  console.log(`Application is running on http://localhost:${port}`);
}
bootstrap();
