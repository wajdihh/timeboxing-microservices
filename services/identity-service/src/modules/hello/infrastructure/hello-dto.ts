import { HelloMessage } from '../domain/hello-message.entity';

export class HelloDTO {
  constructor(public readonly message: string) {}

  toDomain() {
    return new HelloMessage(this.message);
  }

  fromDomain(domain: HelloMessage) {
    return new HelloDTO(domain.message);
  }
}
