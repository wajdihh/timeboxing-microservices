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
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
  
      //Domain error with static statusCode
      if (exception instanceof BaseDomainError) {
        const ctor = exception.constructor as typeof BaseDomainError;
        const status = ctor.statusCode ?? HttpStatus.BAD_REQUEST;
  
        return response.status(status).json({
          statusCode: status,
          message: exception.message,
          error: exception.name,
        });
      }
  
      //NestJS exception
      if (exception instanceof HttpException) {
        const status = exception.getStatus();
        const body = exception.getResponse();
        return response.status(status).json(
          typeof body === 'string'
            ? { statusCode: status, message: body }
            : body
        );
      }
  
      // Unhandled exception
      console.error('[Unhandled Exception]', exception);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }
  