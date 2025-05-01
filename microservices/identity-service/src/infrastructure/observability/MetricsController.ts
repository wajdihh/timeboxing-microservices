import { Controller, Get, Req, Res } from '@nestjs/common';
import { CollectMetricsUseCase } from '@identity/application/observability/CollectMetricsUseCase';
import { Request, Response } from 'express';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly collectMetricsUseCase: CollectMetricsUseCase) {}

  @Get()
  async getMetrics(@Req() req: Request, @Res() res: Response): Promise<void> {
    const timer = this.collectMetricsUseCase.startRequestTimer(req.method, req.path);

    try {
      const metrics = await this.collectMetricsUseCase.getMetrics();

      res.set('Content-Type', 'text/plain; version=0.0.4').status(200).send(metrics);

      this.collectMetricsUseCase.incrementRequestCounter(req.method, req.path, '200');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to collect metrics';

      this.collectMetricsUseCase.incrementErrorCounter(req.method, req.path, '500');
      res.status(500).json({
        statusCode: 500,
        message: errorMessage,
      });
    } finally {
      timer();
    }
  }
}
