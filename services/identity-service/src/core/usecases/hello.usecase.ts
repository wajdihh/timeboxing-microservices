import { Injectable } from '@nestjs/common';
import { HelloMessage } from '../domain/hello-message.entity';
import { HelloRepository } from '../ports/hello.repository';

@Injectable()
export class HelloUseCase {
  constructor(private readonly helloRepository: HelloRepository) {}

  async execute(): Promise<HelloMessage> {
    return this.helloRepository.getMessage();
  }
}
