import { Module } from '@nestjs/common';
import { MetricsController } from '../api/metrics.controller';
import { MetricsService } from '../core/usecases/metrics.service';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
