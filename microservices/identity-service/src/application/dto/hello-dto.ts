import { HelloMessage } from '../../domain/entities/hello-message.entity';

export class HelloDTO {
  constructor(public readonly message: string) {}

  toDomain() {
    console.log('test zajdi');
    return new HelloMessage(this.message);
  }

  fromDomain(domain: HelloMessage) {
    console.log(domain);
    return new HelloDTO(domain.message);
  }
}
