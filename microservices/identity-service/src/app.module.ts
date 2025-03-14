import { Module } from '@nestjs/common';
import { HelloModule } from './modules/hello.module';
import { MetricsModule } from './modules/metrics.module';

@Module({
  imports: [HelloModule, MetricsModule],
})
export class AppModule {}
