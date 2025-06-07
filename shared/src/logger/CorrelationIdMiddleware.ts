import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestContextService } from './RequestContextService';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    RequestContextService.startRequest(() => {
      const correlationId = req.headers[CORRELATION_ID_HEADER] || uuidv4();
      RequestContextService.setCorrelationId(correlationId as string);

      res.setHeader(CORRELATION_ID_HEADER, correlationId);

      next();
    });
  }
}
