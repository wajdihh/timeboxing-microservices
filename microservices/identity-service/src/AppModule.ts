import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SampleModule } from '@identity/infrastructure/sample/SampleModule';
import { MetricsModule } from '@identity/infrastructure/observability/MetricsModule';
import { LoggingModule, CorrelationIdMiddleware } from '@timeboxing/shared';
//ADD Import with @ like @identity
@Module({
  imports: [LoggingModule, SampleModule, MetricsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*path');
  }
}
