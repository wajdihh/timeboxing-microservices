import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { RequestContextService } from './RequestContextService';

export interface LogContext {
  useCase?: string;
  [key: string]: unknown;
}

@Injectable({ scope: Scope.TRANSIENT }) // TRANSIENT to get a new instance for each class that injects it, ensuring context is fresh
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private serviceName: string;

  constructor(
    // We can't inject ConfigService directly here if LoggerService is used by ConfigService itself (circular dep)
    private readonly configService?: ConfigService, // Optional for now
  ) {
    this.serviceName = this.configService?.get<string>('SERVICE_NAME') || 'unknown-service';
    const logLevel = this.configService?.get<string>('LOG_LEVEL') || 'info';

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(info => {
              const { timestamp, level, message, service, useCase, correlationId, ...meta } = info;
              let log = `${timestamp} [${level}] (${service || this.serviceName})`;
              if (correlationId) log += ` [${correlationId}]`;
              if (useCase) log += ` (${useCase})`;
              log += `: ${message}`;
              if (Object.keys(meta).length) {
                log += ` ${JSON.stringify(meta)}`;
              }
              return log;
            })
          )
        }),
      ],
    });

    // For production, ensure JSON logging to console if that's the target
    // and add file transports.
    if (process.env.NODE_ENV === 'production') {
      this.logger.transports.forEach(t => {
        if (t instanceof winston.transports.Console) {
          t.format = winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          );
        }
      });
      this.logger.add(new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }));
      this.logger.add(new winston.transports.File({ 
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }));
    }
  }

  private formatMessage(message: unknown, context?: string | LogContext): Record<string, unknown> {
    const correlationId = RequestContextService.getCorrelationId();
    const baseLog: Record<string, unknown> = {
      service: this.serviceName,
      correlationId: correlationId,
    };

    if (typeof context === 'string') {
      // If context is a string, NestJS often passes the class name here.
      // We can treat it as a simple context tag or part of the useCase.
      baseLog.contextHint = context;
    } else if (context && typeof context === 'object') {
      Object.assign(baseLog, context); // Merge LogContext fields
    }
    
    if (typeof message === 'object' && message !== null) {
        return { ...baseLog, ...(message as Record<string, unknown>) };
    }

    return { ...baseLog, message };
  }

  log(message: unknown, context?: string | LogContext) {
    const logObject = this.formatMessage(message, context);
    this.logger.info(logObject as winston.Logform.TransformableInfo);
  }

  error(message: unknown, trace?: string, context?: string | LogContext) {
    const logObject = this.formatMessage(message, context);
    if (trace) {
      logObject.stacktrace = trace;
    }
    this.logger.error(logObject as winston.Logform.TransformableInfo);
  }

  warn(message: unknown, context?: string | LogContext) {
    const logObject = this.formatMessage(message, context);
    this.logger.warn(logObject as winston.Logform.TransformableInfo);
  }

  debug(message: unknown, context?: string | LogContext) {
    const logObject = this.formatMessage(message, context);
    this.logger.debug(logObject as winston.Logform.TransformableInfo);
  }

  verbose(message: unknown, context?: string | LogContext) {
    const logObject = this.formatMessage(message, context);
    this.logger.verbose(logObject as winston.Logform.TransformableInfo);
  }
}
