import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MetricsModule } from '@identity/infrastructure/observability/MetricsModule';
import { UserModule } from '@identity/infrastructure/user/UserModule';
@Module({
  imports: [MetricsModule, UserModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //TODO consumer.apply(CorrelationIdMiddleware).forRoutes('*path');
  }
}
