import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { RequestContextService } from './RequestContextService';
import { BaseError, ErrorType } from '../errors';

export interface LogContext {
  useCase?: string;
  [key: string]: unknown;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private readonly serviceName: string;

  constructor(private readonly configService?: ConfigService) {
    this.serviceName = this.configService?.get<string>('SERVICE_NAME') || 'unknown-service';
    const logLevel = this.configService?.get<string>('LOG_LEVEL') || 'info';

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        process.env.NODE_ENV === 'production'
          ? winston.format.json()
          : winston.format.colorize({ all: true }),
      ),
      transports: [
        new winston.transports.Console(),
        ...(process.env.NODE_ENV === 'production'
          ? [
              new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
              new winston.transports.File({ filename: 'logs/combined.log' }),
            ]
          : []),
      ],
    });
  }

  private buildLogObject(message: unknown, context?: string | LogContext): Record<string, unknown> {
    const correlationId = RequestContextService.getCorrelationId();
    const log: Record<string, unknown> = {
      service: this.serviceName,
      correlationId,
    };

    if (typeof context === 'string') {
      log.useCase = context;
    } else if (context && typeof context === 'object') {
      Object.assign(log, context);
    }

    if (message instanceof BaseError) {
      log.message = message.message;
      log.errorType = message.errorType;
      log.name = message.name;
      log.stacktrace = message.stack;
      if (message.originalError) {
        log.originalError = message.originalError instanceof Error
          ? { message: message.originalError.message, stack: message.originalError.stack }
          : message.originalError;
      }
    } else if (message instanceof Error) {
      log.message = message.message;
      log.errorType = ErrorType.UNKNOWN;
      log.name = message.name;
      log.stacktrace = message.stack;
    } else if (typeof message === 'object' && message !== null) {
      Object.assign(log, message);
    } else {
      log.message = message;
    }

    return log;
  }

  log(message: unknown, context?: string | LogContext) {
    this.logger.info(this.buildLogObject(message, context));
  }

  error(message: unknown, trace?: string, context?: string | LogContext) {
    const log = this.buildLogObject(message, context);
    if (trace && !log.stacktrace) log.stacktrace = trace;
    this.logger.error(log);
  }

  warn(message: unknown, context?: string | LogContext) {
    this.logger.warn(this.buildLogObject(message, context));
  }

  debug(message: unknown, context?: string | LogContext) {
    this.logger.debug(this.buildLogObject(message, context));
  }

  verbose(message: unknown, context?: string | LogContext) {
    this.logger.verbose(this.buildLogObject(message, context));
  }
}