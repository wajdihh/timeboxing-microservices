import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { BaseDomainError } from './BaseDomainError';

  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    constructor() {} 
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest();

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
        console.warn(`[GlobalExceptionFilter] Domain Error: ${message}. Name: ${errorName}. Path: ${request.url}. Method: ${request.method}. Stack: ${exception instanceof Error ? exception.stack : 'N/A'}`);
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
        console.warn(`[GlobalExceptionFilter] HTTP Exception: ${message}. Name: ${errorName}. Path: ${request.url}. Method: ${request.method}. Stack: ${exception instanceof Error ? exception.stack : 'N/A'}`);
              }
      // Unhandled exception
      else {
        console.error(`[GlobalExceptionFilter] Entering unhandled exception block. Exception type: ${typeof exception}. Stringified: ${String(exception)}`);

        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
        
        const err = exception instanceof Error ? exception : null;
        errorName = err?.name || 'UnknownError';
        const exceptionMessage = err?.message || String(exception);
        const exceptionStack = err?.stack;

        responseBody = {
          statusCode: status,
          message: message, 
          error: errorName, 
          detail: exceptionMessage, 
        };
        console.error(
          `[GlobalExceptionFilter] Unhandled Exception: ${exceptionMessage}. Name: ${errorName}. Path: ${request.url}. Method: ${request.method}.`,
          exceptionStack
        );
      }
  
      return response.status(status).json(responseBody);
    }
  }
