import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

type SwaggerOptions = {
  path?: string;
  title?: string;
  description?: string;
  version?: string;
};

// This function sets up Swagger documentation for the NestJS application.
export function setupSwagger(app: INestApplication, options?: SwaggerOptions): void {
  if (process.env.NODE_ENV === 'production') return;

  const config = new DocumentBuilder()
    .setTitle(options?.title ?? 'TimeBoxing API')
    .setDescription(options?.description ?? 'API documentation')
    .setVersion(options?.version ?? '1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(options?.path ?? 'docs', app, document);
}
