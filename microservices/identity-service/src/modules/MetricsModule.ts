import { Module } from '@nestjs/common';
import { MetricsController } from '../infrastructure/controllers/rest/MetricsController';
import { MetricsService } from '../application/services/MetricsService';
import { PrometheusMetricsAdapter } from '../infrastructure/adapters/external-services/PrometheusMetricsAdapter';
//TODO: Replace ../infrastructure by @identity/infrastructure
@Module({
  controllers: [MetricsController],
  providers: [
    {
      provide: 'PrometheusMetricsAdapter',
      useClass: PrometheusMetricsAdapter,
    },
    {
      provide: MetricsService,
      useFactory: (repo: PrometheusMetricsAdapter) => new MetricsService(repo),
      inject: ['PrometheusMetricsAdapter'],
    },
  ],
})
export class MetricsModule {}
