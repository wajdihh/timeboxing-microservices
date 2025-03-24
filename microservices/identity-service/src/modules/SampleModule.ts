import { Module } from '@nestjs/common';
import { SampleService } from '@identity/application/services/SampleService';
import { SampleController } from '@identity/infrastructure/controllers/rest/SampleController';
import { InMemorySampleRepository } from '@identity/infrastructure/adapters/database/InMemorySampleRepository';
import { PrefixSampleAdapter } from '@identity/infrastructure/adapters/external-services/PrefixSampleAdapter';

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
