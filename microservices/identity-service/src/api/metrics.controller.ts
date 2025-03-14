import { Controller, Get, Res } from '@nestjs/common';
import { MetricsService } from '../core/usecases/metrics.service';
import { Response } from 'express';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', this.metricsService.register.contentType);
    const metrics = await this.metricsService.getMetrics();
    res.end(metrics);
  }
}
