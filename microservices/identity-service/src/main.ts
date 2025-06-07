import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { setupSwagger } from '@timeboxing/shared';
import { GlobalExceptionFilter } from '@timeboxing/shared';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from '@timeboxing/shared/logger';

async function bootstrap() {
  // Get an instance of LoggerService from the AppModule
  // This is a bit of a workaround because we need the logger before the app is fully initialized
  // but LoggerService itself might depend on ConfigService which is part of AppModule.
  // A more robust way might involve a pre-bootstrap step or a static logger instance for bootstrap.
  // For now, we'll retrieve it from the app context after a preliminary create.
  // This assumes LoggerModule.forRootAsync() has made LoggerService available.
  
  // Create a preliminary app to get LoggerService instance
  const tempApp = await NestFactory.createApplicationContext(AppModule);
  const logger = tempApp.get(LoggerService);
  await tempApp.close(); // Close the temporary context

  const app = await NestFactory.create(AppModule, {
    logger: logger, // Use our custom logger
  });

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
