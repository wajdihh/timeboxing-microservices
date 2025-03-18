import { Module } from '@nestjs/common';
import { LoggerService } from './core/logger.service';
import { CorrelationIdMiddleware } from './infrastructure/correlation-id.middleware';
import { RequestContextService } from './core/request-context.service';
import { ExecutionTimeInterceptor } from './core/execution-time.interceptor';

@Module({
  providers: [
    LoggerService,
    CorrelationIdMiddleware,
    RequestContextService,
    ExecutionTimeInterceptor,
  ],
  exports: [
    LoggerService,
    CorrelationIdMiddleware,
    RequestContextService,
    ExecutionTimeInterceptor,
  ],
})
export class LoggingModule {}