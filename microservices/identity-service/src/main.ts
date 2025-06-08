import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { LoggerService, LoggingInterceptor, setupSwagger } from '@timeboxing/shared'; // Corrected import, Added LoggingInterceptor
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
  // app.useGlobalFilters(app.get(GlobalExceptionFilter)); // Temporarily comment out
  // Enable validation pipe -> This will automatically validate incoming requests based on the DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true, // Delete and ignore extra field before reaching code
    forbidNonWhitelisted: true // Raise exception when there is extra fields vs DTO
   }));
  await app.listen(port);

}
bootstrap().catch(err => {
  // Fallback logger if NestJS logger isn't available or error is too early
  console.error('FATAL ERROR during bootstrap:');
  if (err instanceof Error) {
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
  } else {
    // If it's not an Error instance, try to inspect it
    console.error('Raw error object:', err);
    try {
      console.error('Stringified error:', String(err));
      console.error('JSON.stringified error:', JSON.stringify(err));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.error('Could not stringify or JSON.stringify the error object.');
    }
  }
  process.exit(1);
});
