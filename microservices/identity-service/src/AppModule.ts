import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MetricsModule } from '@identity/infrastructure/observability/MetricsModule';
import { UserModule } from '@identity/infrastructure/user/UserModule';
import { AuthModule } from './infrastructure/auth/AuthModule';
import { PrismaModule } from './infrastructure/prisma/PrismaModule';
import { AppConfigModule } from './config/AppConfigModule';
@Module({
  imports: [AppConfigModule, MetricsModule, UserModule, AuthModule, PrismaModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //TODO consumer.apply(CorrelationIdMiddleware).forRoutes('*path');
  }
}
