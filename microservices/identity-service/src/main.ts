import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { setupSwagger } from '@timeboxing/shared';
import { GlobalExceptionFilter } from '@timeboxing/shared';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(port);

  console.log(`🚀 Server is running on port ` + port);
}
bootstrap();
