import { ID, ResultValue } from "@timeboxing/shared";
import { UserEntity } from "./UserEntity";
import { EmailValue } from "./value-objects/EmailValue";

export interface UserRepository {
  findByID(id: ID): Promise<ResultValue<UserEntity | null>>;
  findByEmail(email: EmailValue): Promise<ResultValue<UserEntity | null>>;
  save(user: UserEntity): Promise<void>;
  delete(id: ID): Promise<void>;
}
export const USER_REPOSITORY = Symbol('UserRepository');
