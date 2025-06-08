import { Module } from '@nestjs/common';
import { HealthController } from './HealthController';
import { PrismaModule } from '../../prisma/PrismaModule';
import { RedisIntegrationModule } from '../../redis/RedisIntegrationModule';

@Module({
  imports: [
    PrismaModule,
    RedisIntegrationModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
