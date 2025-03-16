import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`${method} ${originalUrl} - ${Date.now() - now}ms`);
        },
        error: (error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          const stackTrace = error instanceof Error ? error.stack : undefined;
          this.logger.error(
            `${method} ${originalUrl} - ${Date.now() - now}ms - Error: ${errorMessage}`,
            stackTrace,
          );
        },
      }),
    );
  }
}
