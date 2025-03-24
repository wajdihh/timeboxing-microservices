import { Module } from '@nestjs/common';
import { MetricsController } from '@identity/infrastructure/controllers/rest/MetricsController';
import { MetricsService } from '@identity/application/services/MetricsService';
import { PrometheusMetricsAdapter } from '@identity/infrastructure/adapters/external-services/PrometheusMetricsAdapter';

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
