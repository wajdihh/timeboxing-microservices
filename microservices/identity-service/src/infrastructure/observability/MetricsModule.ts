import { Module } from '@nestjs/common';
import { MetricsController } from '@identity/infrastructure/observability/MetricsController';
import { CollectMetricsUseCase } from '@identity/application/observability/CollectMetricsUseCase';
import { PrometheusMetricsAdapter } from '@identity/infrastructure/observability/PrometheusMetricsAdapter';

@Module({
  controllers: [MetricsController],
  providers: [
    {
      provide: 'PrometheusMetricsAdapter',
      useClass: PrometheusMetricsAdapter,
    },
    {
      provide: CollectMetricsUseCase,
      useFactory: (repo: PrometheusMetricsAdapter) => new CollectMetricsUseCase(repo),
      inject: ['PrometheusMetricsAdapter'],
    },
  ],
})
export class MetricsModule {}
