import { Module } from '@nestjs/common';
import { MetricsController } from '../infrastructure/controllers/rest/metrics.controller';
import { MetricsService } from '../application/services/metrics.service';
import { PrometheusMetricsRepository } from '../infrastructure/repository/prometheus-metrics.repository';
import { METRICS_REPOSITORY_TOKEN } from '../domain/repositories/metrics.repository';

@Module({
  controllers: [MetricsController],
  providers: [
    {
      provide: METRICS_REPOSITORY_TOKEN,
      useClass: PrometheusMetricsRepository,
    },
    {
      provide: MetricsService,
      useFactory: (repo: PrometheusMetricsRepository) =>
        new MetricsService(repo),
      inject: [METRICS_REPOSITORY_TOKEN],
    },
  ],
})
export class MetricsModule {}
