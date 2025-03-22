import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HelloModule } from './modules/hello.module';
import { MetricsModule } from './modules/metrics.module';
import { LoggingModule, CorrelationIdMiddleware } from '@timeboxing/libs';

@Module({
  imports: [LoggingModule, HelloModule, MetricsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*path');
  }
}
