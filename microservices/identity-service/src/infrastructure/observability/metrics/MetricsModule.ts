import { Module } from '@nestjs/common';
import { CollectMetricsUseCase } from '@identity/application/observability/CollectMetricsUseCase';
import { MetricsController } from './MetricsController';
import { PrometheusMetricsAdapter } from './PrometheusMetricsAdapter';

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
