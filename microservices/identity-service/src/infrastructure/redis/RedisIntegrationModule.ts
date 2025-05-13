import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RedisService } from './RedisService';

@Module({
  imports: [
    RedisModule.forRoot({
      readyLog: true,
      config: {
        namespace: 'default',
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
//I used this name to avoid RedisModule @lialiaots lib used name conflit
export class RedisIntegrationModule {}
