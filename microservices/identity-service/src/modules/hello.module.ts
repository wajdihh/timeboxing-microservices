import { Module } from '@nestjs/common';
import { HelloUseCase } from '../application/services/hello.service';
import { InMemoryHelloRepository } from '../infrastructure/repository/in-memory-hello.repository';
import { HelloController } from '../infrastructure/controllers/rest/hello.controller';

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
