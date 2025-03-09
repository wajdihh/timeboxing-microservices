import { HelloMessage } from './hello-message.entity';

export interface HelloRepository {
  getMessage(): Promise<HelloMessage>;
}
