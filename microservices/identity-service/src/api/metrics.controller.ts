import { Controller, Get, Req, Res, UseInterceptors } from '@nestjs/common';
import { MetricsService } from '../core/services/metrics.service';
import { Request, Response } from 'express';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@Controller('metrics')
@UseInterceptors(LoggingInterceptor)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Req() req: Request, @Res() res: Response): Promise<void> {
    const timer = this.metricsService.startRequestTimer(req.method, req.path);

    try {
      const metrics = await this.metricsService.getMetrics();

      res
        .set('Content-Type', 'text/plain; version=0.0.4')
        .status(200)
        .send(metrics);

      this.metricsService.incrementRequestCounter(req.method, req.path, '200');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to collect metrics';

      this.metricsService.incrementErrorCounter(req.method, req.path, '500');
      res.status(500).json({
        statusCode: 500,
        message: errorMessage,
      });
    } finally {
      timer();
    }
  }
}
