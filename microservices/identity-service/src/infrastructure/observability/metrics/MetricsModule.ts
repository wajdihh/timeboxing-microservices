import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { CollectMetricsUseCase } from '@identity/application/observability/CollectMetricsUseCase';
import { MetricsController } from './MetricsController';
import { PROMETHEUSE_METRICS_ADAPTER, PrometheusMetricsAdapter } from './PrometheusMetricsAdapter';
import { MetricsMiddleware } from './MetricsMiddleware';

/**
 * @Global()
  • One singleton instance.
	•	No double registration in Prometheus.
	•	One consistent /metrics endpoint.
 */
@Global()
@Module({
  controllers: [MetricsController],
  providers: [
    PrometheusMetricsAdapter,
    {
      provide: PROMETHEUSE_METRICS_ADAPTER, // Provide the symbol
      useExisting: PrometheusMetricsAdapter, // Map it to the singleton instance
    },
    {
      provide: CollectMetricsUseCase,
      useFactory: (repo: PrometheusMetricsAdapter) => new CollectMetricsUseCase(repo),
      inject: [PrometheusMetricsAdapter], // CollectMetricsUseCase can still inject the class directly
    },
  ],
  exports: [PrometheusMetricsAdapter, PROMETHEUSE_METRICS_ADAPTER], // Export both to avoid do it in UserModule and otherModule and then we create new instance of PrometheusMetricsAdapter
})
export class MetricsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
