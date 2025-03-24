import { Module } from '@nestjs/common';
import { SampleService } from '../application/services/SampleService';
import { SampleController } from '../infrastructure/controllers/rest/SampleController';
import { InMemorySampleRepository } from '../infrastructure/adapters/database/InMemorySampleRepository';
import { PrefixSampleAdapter } from '../infrastructure/adapters/external-services/PrefixSampleAdapter';

@Module({
  controllers: [SampleController],
  providers: [
    {
      provide: 'InMemorySampleRepository',
      useClass: InMemorySampleRepository,
    },
    {
      provide: 'PrefixSampleAdapter',
      useClass: PrefixSampleAdapter,
    },
    {
      provide: SampleService,
      useFactory: (repo: InMemorySampleRepository, port: PrefixSampleAdapter) =>
        new SampleService(repo, port),
      inject: ['InMemorySampleRepository', 'PrefixSampleAdapter'],
    },
  ],
})
export class SampleModule {}
