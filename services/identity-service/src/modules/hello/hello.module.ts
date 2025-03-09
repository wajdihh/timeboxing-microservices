import { Module } from '@nestjs/common';
import { HelloController } from './api/hello.controller';
import { HelloUseCase } from './domain/hello.usecase';
import { InMemoryHelloRepository } from './infrastructure/in-memory-hello.repository';

@Module({
  controllers: [HelloController],
  providers: [
    {
      provide: 'HelloRepository',
      useClass: InMemoryHelloRepository,
    },
    {
      provide: HelloUseCase,
      useFactory: (repo: InMemoryHelloRepository) => new HelloUseCase(repo),
      inject: ['HelloRepository'],
    },
  ],
})
export class HelloModule {}
