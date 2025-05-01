import { Module } from '@nestjs/common';
import { HandleSampleUseCase } from '@identity/application/sample/HandleSampleUseCase';
import { SampleController } from '@identity/infrastructure/sample/SampleController';
import { InMemorySampleRepository } from '@identity/infrastructure/sample/InMemorySampleRepository';
import { PrefixSampleAdapter } from '@identity/infrastructure/sample/ExternalServiceSampleAdapter';

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
      provide: HandleSampleUseCase,
      useFactory: (repo: InMemorySampleRepository, port: PrefixSampleAdapter) =>
        new HandleSampleUseCase(repo, port),
      inject: ['InMemorySampleRepository', 'PrefixSampleAdapter'],
    },
  ],
})
export class SampleModule {}
