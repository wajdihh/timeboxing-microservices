import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrometheusMetricsAdapter } from './PrometheusMetricsAdapter';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    constructor(private readonly metricsAdapter: PrometheusMetricsAdapter) { }

    use(req: Request, res: Response, next: NextFunction): void {
        const route = (req.originalUrl || req.url || req.path).split('?')[0];
        const method = req.method;

        // Start the timer for the histogram
        const endTimer = this.metricsAdapter.startRequestTimer(method, route, res.statusCode.toString());

        res.on('finish', () => {
            endTimer(); // record histogram observation

            // Increment request counter
            this.metricsAdapter.incrementRequestCounter(method, route, res.statusCode.toString());

            // Increment error counter if status code >= 400
            if (res.statusCode >= 400) {
                this.metricsAdapter.incrementErrorCounter(method, route, res.statusCode.toString());
            }
        });

        next();
    }
}