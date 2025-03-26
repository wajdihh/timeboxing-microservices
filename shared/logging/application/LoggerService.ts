import { Injectable, Logger, Scope } from '@nestjs/common';
import { winstonLogger } from '../infrastructure/winstonLogger';
import { RequestContextService } from './RequestContextService';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private readonly logger = winstonLogger;

  log(message: string, context?: string) {
    message= this.buildMessageWithCorrelationId(message);
    this.logger.log(message, context);
  }

  error(message: string, trace: string, context?: string) {
    message= this.buildMessageWithCorrelationId(message);
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    message= this.buildMessageWithCorrelationId(message);
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    message= this.buildMessageWithCorrelationId(message);
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: string) {
    message= this.buildMessageWithCorrelationId(message);
    this.logger.verbose(message, context);
  }

  buildMessageWithCorrelationId(message: string) {
    const correlationId = RequestContextService.getCorrelationId();
    if (correlationId) {
      return `[CorrelationId: ${correlationId}] ${message}`;
    }
    return message;
  }
}
