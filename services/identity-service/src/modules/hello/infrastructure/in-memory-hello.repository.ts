import { Injectable } from '@nestjs/common';
import { HelloRepository } from '../domain/hello.repository';
import { HelloDTO } from './hello-dto';
import { HelloMessage } from '../domain/hello-message.entity';

@Injectable()
export class InMemoryHelloRepository implements HelloRepository {
  getMessage(): Promise<HelloMessage> {
    return Promise.resolve(new HelloDTO('Hello, World!').toDomain());
  }
}
