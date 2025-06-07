import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core'; // Re-add APP_GUARD
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'; // Re-add ThrottlerGuard
import { MetricsModule } from '@identity/infrastructure/observability/MetricsModule';
import { UserModule } from '@identity/infrastructure/user/UserModule';
import { AuthModule } from './infrastructure/auth/AuthModule';
import { PrismaModule } from './infrastructure/prisma/PrismaModule';
import { AppConfigModule } from './config/AppConfigModule';
import { CorrelationIdMiddleware, LoggerModule } from '@timeboxing/shared/logger';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync(),
    MetricsModule,
    UserModule,
    AuthModule,
    PrismaModule,
    ThrottlerModule.forRoot([ // Single default configuration
      {
        ttl: 60000, 
        limit: 10, // Default limit for all routes unless overridden
      },
    ]),
  ],
  providers: [
    { // Re-instate ThrottlerGuard as a global guard
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
