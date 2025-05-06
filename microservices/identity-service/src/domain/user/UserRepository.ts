import { ResultValue } from "@timeboxing/shared";
import { UserEntity } from "./UserEntity";
import { EmailValue } from "./value-objects/EmailValue";

export interface UserRepository {
  findByEmail(email: EmailValue): Promise<ResultValue<UserEntity | null>>;
  save(user: UserEntity): Promise<void>;
}
export const USER_REPOSITORY = Symbol('UserRepository');