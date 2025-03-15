import { Module } from '@nestjs/common';
import { HelloUseCase } from '../core/usecases/hello.usecase';
import { InMemoryHelloRepository } from '../infrastructure/repository/in-memory-hello.repository';
import { HelloController } from '../api/hello.controller';

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
