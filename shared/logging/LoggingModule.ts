import { Module } from '@nestjs/common';
import { LoggerService } from './application/LoggerService';
import { CorrelationIdMiddleware } from './infrastructure/CorrelationIdMiddleware';
import { RequestContextService } from './application/RequestContextService';
import { ExecutionTimeInterceptor } from './application/ExecutionTimeInterceptor';

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