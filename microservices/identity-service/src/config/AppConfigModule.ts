import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import * as path from 'path';
import JwtConfigUtil from './JwtConfigMapper';
import { JwtConfigService } from './JwtConfigService';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [JwtConfigUtil],
      envFilePath: path.resolve(
        __dirname,
        `../../infra/docker/.env.${process.env.NODE_ENV || 'local'}`
      ),
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().optional(),
        JWT_REFRESH_EXPIRATION: Joi.string().optional(),
      }),
    }),
  ],
  providers: [JwtConfigService], 
  exports: [JwtConfigService],
})
export class AppConfigModule {}
