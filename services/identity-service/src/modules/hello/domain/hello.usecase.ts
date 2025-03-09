import { Injectable } from '@nestjs/common';
import { HelloRepository } from './hello.repository';
import { HelloMessage } from './hello-message.entity';

@Injectable()
export class HelloUseCase {
  constructor(private readonly helloRepository: HelloRepository) {}

  async execute(): Promise<HelloMessage> {
    return this.helloRepository.getMessage();
  }
}
