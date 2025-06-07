import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { LoggerService, LoggingInterceptor, setupSwagger } from '@timeboxing/shared'; // Corrected import, Added LoggingInterceptor
import { GlobalExceptionFilter } from '@timeboxing/shared';
import { ValidationPipe } from '@nestjs/common';
// LoggerService already imported from @timeboxing/shared

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer initial logs
  });
  
  // Set our custom LoggerService as the application logger
  app.useLogger(app.get(LoggerService));

  // Apply the LoggingInterceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(LoggerService)));

  // Enable CORS
  app.enableCors();

  // Set API prefix
  app.setGlobalPrefix('api');

  setupSwagger(app, {
    path: 'api',
    title: 'Identity Service',
    description: 'Handles user registration, login, and authentication',
    version: '1.0.0',
  });
  const port = process.env.PORT ?? 3000;
  //Catch Exceptions from domain layer or application layer
  app.useGlobalFilters(new GlobalExceptionFilter());
  // Enable validation pipe -> This will automatically validate incoming requests based on the DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true, // Delete and ignore extra field before reaching code
    forbidNonWhitelisted: true // Raise exception when there is extra fields vs DTO
   }));
  await app.listen(port);

}
bootstrap();
