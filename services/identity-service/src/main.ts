import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Set API prefix (optional)
  app.setGlobalPrefix('api');

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Identity Service API') // Change per service
    .setDescription('API documentation for the Identity Service')
    .setVersion('1.0')
    .addTag('identity')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
