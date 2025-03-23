import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { RequestContextService } from "./request-context.service";

@Injectable()
export class ExecutionTimeInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        return next.handle().pipe(
          tap(() => {
            const correlationId = RequestContextService.getCorrelationId();
            console.log(`[${correlationId}] Execution Time: ${Date.now() - now}ms`);
          }),
        );
      }
}