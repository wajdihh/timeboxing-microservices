import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Inject,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { BaseDomainError } from './BaseDomainError';
  import { LoggerService } from '../logger/LoggerService'; // Assuming LoggerService is in a 'logger' subdir

  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest(); // Get request for more log context

      let status: HttpStatus;
      let message: string;
      let errorName: string | undefined;
      let responseBody: object;

      //Domain error with static statusCode
      if (exception instanceof BaseDomainError) {
        const ctor = exception.constructor as typeof BaseDomainError;
        status = ctor.statusCode ?? HttpStatus.BAD_REQUEST;
        message = exception.message;
        errorName = exception.name;
        responseBody = {
          statusCode: status,
          message: message,
          error: errorName,
        };
        this.logger.warn(
          { 
            message: `Domain Error: ${message}`, 
            errorName, 
            path: request.url, 
            method: request.method,
            exceptionStack: exception.stack,
          }, 
          GlobalExceptionFilter.name
        );
      }
      //NestJS exception
      else if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        if (typeof exceptionResponse === 'string') {
          message = exceptionResponse;
          responseBody = { statusCode: status, message };
        } else {
          responseBody = exceptionResponse as object;
          if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
            message = Array.isArray((exceptionResponse as { message: string | string[] }).message) 
              ? (exceptionResponse as { message: string[] }).message.join(', ') 
              : (exceptionResponse as { message: string }).message;
          } else {
            message = 'Http Exception';
          }
        }
        errorName = exception.constructor.name;
        this.logger.warn(
          { 
            message: `HTTP Exception: ${message}`, 
            errorName, 
            path: request.url, 
            method: request.method,
            responseBody,
            exceptionStack: exception.stack,
          }, 
          GlobalExceptionFilter.name
        );
      }
      // Unhandled exception
      else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
        errorName = (exception as Error)?.name || 'UnknownError';
        responseBody = {
          statusCode: status,
          message: message,
        };
        this.logger.error(
          { 
            message: `Unhandled Exception: ${(exception as Error)?.message || String(exception)}`, 
            errorName, 
            path: request.url, 
            method: request.method,
            exceptionStack: (exception as Error)?.stack,
          },
          (exception as Error)?.stack, 
          GlobalExceptionFilter.name
        );
      }
  
      return response.status(status).json(responseBody);
    }
  }
