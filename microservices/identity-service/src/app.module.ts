import { Module } from '@nestjs/common';
import { HelloModule } from './modules/hello.module';
import { MetricsModule } from './modules/metrics.module';
//import { LoggingModule, CorrelationIdMiddleware } from '@timeboxing/shared';

@Module({
  //imports: [LoggingModule, HelloModule, MetricsModule],
  imports: [HelloModule, MetricsModule],
})
export class AppModule {}
//export class AppModule implements NestModule {
//  configure(consumer: MiddlewareConsumer) {
//  consumer.apply(CorrelationIdMiddleware).forRoutes('*path');
//}
//}
