import { Injectable } from '@nestjs/common';
import { HelloMessage } from '../../domain/entities/hello-message.entity';
import { HelloRepository } from '../../domain/repositories/hello.repository';
import { HelloDTO } from '../../application/dto/hello-dto';

@Injectable()
export class InMemoryHelloRepository implements HelloRepository {
  getMessage(): Promise<HelloMessage> {
    console.log('test InMemoryHelloRepository');
    return Promise.resolve(new HelloDTO('Hello, World!').toDomain());
  }
}
