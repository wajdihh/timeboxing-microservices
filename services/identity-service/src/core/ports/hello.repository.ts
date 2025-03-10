import { HelloMessage } from '../domain/hello-message.entity';

export interface HelloRepository {
  getMessage(): Promise<HelloMessage>;
}
