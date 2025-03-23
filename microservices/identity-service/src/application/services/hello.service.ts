import { Injectable } from '@nestjs/common';
import { HelloMessage } from '../../domain/entities/hello-message.entity';
import { HelloRepository } from '../../domain/repositories/hello.repository';

@Injectable()
export class HelloService {
  constructor(private readonly helloRepository: HelloRepository) {}

  async execute(): Promise<HelloMessage> {
    return this.helloRepository.getMessage();
  }
}
