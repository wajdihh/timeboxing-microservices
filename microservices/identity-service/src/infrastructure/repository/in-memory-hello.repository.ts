import { Injectable } from '@nestjs/common';
import { HelloMessage } from '../../core/domain/hello-message.entity';
import { HelloRepository } from '../../core/ports/hello.repository';
import { HelloDTO } from '../dto/hello-dto';

@Injectable()
export class InMemoryHelloRepository implements HelloRepository {
  getMessage(): Promise<HelloMessage> {
    console.log('test InMemoryHelloRepository');
    return Promise.resolve(new HelloDTO('Hello, World!').toDomain());
  }
}
