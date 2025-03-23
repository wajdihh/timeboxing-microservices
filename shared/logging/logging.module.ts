import { Module } from '@nestjs/common';
import { LoggerService } from './application/logger.service';
import { CorrelationIdMiddleware } from './infrastructure/correlation-id.middleware';
import { RequestContextService } from './application/request-context.service';
import { ExecutionTimeInterceptor } from './application/execution-time.interceptor';

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