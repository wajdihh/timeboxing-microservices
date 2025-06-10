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
      format: process.env.NODE_ENV === 'production'
        ? winston.format.combine(winston.format.timestamp(), winston.format.json())
        //other envs
        : winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize(), // Colorizes level and message
            winston.format.printf(info => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { timestamp, level, message, service, correlationId, useCase, stacktrace, originalError, errorType, name, ...meta } = info;
              
              let logString = `${timestamp} ${level}:`;
              if (service) logString += ` [${service}]`;
              // correlationId is often part of the default context, let's ensure it's displayed if present
              if (correlationId && typeof correlationId === 'string' && correlationId !== 'undefined') { // Check if it's a meaningful string
                logString += ` [${correlationId}]`;
              }
              if (useCase) logString += ` (${useCase})`;
              
              // The 'message' field from buildLogObject is the primary message.
              // It should already be a string due to buildLogObject's logic.
              logString += ` ${message}`; 
              
              // Append other specific error properties if they exist and are not already in message
              if (name && name !== message) logString += ` Name: ${name}`;
              if (errorType) logString += ` Type: ${errorType}`;

              const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
              if (metaString && metaString !== '{}') logString += ` Meta: ${metaString}`;
              
              if (stacktrace) logString += `\nStack: ${stacktrace}`;
              if (originalError) logString += `\nOriginalError: ${JSON.stringify(originalError)}`;
              
              return logString;
            })
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
    } else if (message === undefined) {
      log.message = '[LoggerService: Undefined message received]';
    } else {
      log.message = message;
    }

    // Ensure a message property always exists, even if the input `message` was an object without one.
    if (log.message === undefined) {
      log.message = '[LoggerService: Log object created without a message property]';
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
