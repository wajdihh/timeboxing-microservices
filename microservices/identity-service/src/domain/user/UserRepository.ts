import { ResultValue } from "@timeboxing/shared";
import { UserEntity } from "./UserEntity";
import { InvalidEmailError } from "./errors/InvalidEmailError";

export interface UserRepository {
  findByEmail(email: string): Promise<ResultValue<UserEntity | null, InvalidEmailError>>;
  save(user: UserEntity): Promise<void>;
}