import { NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RequestContextService } from '../application/request-context.service';

export class CorrelationIdMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        // If an external correlation ID is provided, we reuse it, else we generate a new one.
        const correlationId = req.headers['x-correlation-id'] || uuidv4();
        req.headers['x-correlation-id'] = correlationId;
        res.setHeader('x-correlation-id', correlationId);

        RequestContextService.setCorrelationId(correlationId);
        next();
    }
}