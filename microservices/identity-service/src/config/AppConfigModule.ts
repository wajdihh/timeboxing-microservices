import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import * as path from 'path';
import jwtConfig from './jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      envFilePath: path.resolve(
        __dirname,
        `../../infra/docker/.env.${process.env.NODE_ENV || 'local'}`
      ),
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().optional(),
      }),
    }),
  ],
})
export class AppConfigModule {}
