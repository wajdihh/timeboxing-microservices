import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CollectMetricsUseCase } from '@identity/application/observability/CollectMetricsUseCase';
import { MetricsController } from './MetricsController';
import { PrometheusMetricsAdapter } from './PrometheusMetricsAdapter';
import { MetricsMiddleware } from './MetricsMiddleware';

@Module({
  controllers: [MetricsController],
  providers: [
  PrometheusMetricsAdapter,
  {
    provide: CollectMetricsUseCase,
    useFactory: (repo: PrometheusMetricsAdapter) => new CollectMetricsUseCase(repo),
    inject: [PrometheusMetricsAdapter],
  },
]
})
export class MetricsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
