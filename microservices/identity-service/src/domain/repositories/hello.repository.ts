import { HelloMessage } from '../entities/hello-message.entity';

export interface HelloRepository {
  getMessage(): Promise<HelloMessage>;
}
