import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  LoggerService,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { RequestContextService } from './RequestContextService'; // To get correlationId directly if needed

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {} // LoggerService should be request-scoped

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const { method, originalUrl } = request; // Removed body, headers from destructuring
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;

    // Correlation ID should be set by CorrelationIdMiddleware already
    const correlationId = RequestContextService.getCorrelationId(); // Or this.logger.getCorrelationId() if LoggerService has such a method

    this.logger.log(
      `Incoming Request: ${method} ${originalUrl}`,
      {
        context: LoggingInterceptor.name,
        correlationId, // Explicitly pass, though LoggerService formatMessage should also pick it up
        method,
        url: originalUrl,
        userAgent,
        ip,
        // body: body, // Be cautious logging request bodies, especially in production (PII/sensitive data)
        // headers: headers, // Headers can also contain sensitive info
      }
    );

    const now = Date.now();
    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      tap((_data) => { // data is the response body, prefixed with underscore
        const duration = Date.now() - now;
        this.logger.log(
          `Outgoing Response: ${method} ${originalUrl} - Status: ${response.statusCode} - Duration: ${duration}ms`,
          {
            context: LoggingInterceptor.name,
            correlationId,
            method,
            url: originalUrl,
            statusCode: response.statusCode,
            durationMs: duration,
            // responseBody: data, // Be cautious logging response bodies
          }
        );
      }, (error) => {
        // This logs unhandled errors that bypass GlobalExceptionFilter or occur after it.
        // GlobalExceptionFilter should ideally handle logging for known error types.
        const duration = Date.now() - now;
        this.logger.error(
          `Failed Request: ${method} ${originalUrl} - Status: ${response.statusCode || 500} - Duration: ${duration}ms`,
          error.stack,
          {
            context: LoggingInterceptor.name,
            correlationId,
            method,
            url: originalUrl,
            statusCode: response.statusCode || 500, // error might occur before status code is set
            durationMs: duration,
            error: error.message,
          }
        );
      })
    );
  }
}
