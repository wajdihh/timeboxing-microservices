import { ID, ResultValue } from "@timeboxing/shared";
import { UserEntity } from "../user/UserEntity";

export interface AuthRepository {
    generateAccessToken(user: UserEntity): Promise<ResultValue<string>>;
    generateRefreshToken(user: UserEntity): Promise<ResultValue<string>>;
    verifyRefreshToken(token: string): Promise<ResultValue<ID>>;
  }
  export const AUTH_REPOSITORY = Symbol('AuthRepository');