import { ResultValue } from "@timeboxing/shared";
import { UserEntity } from "../user/UserEntity";

export interface TokenService {
    generateAccessToken(user: UserEntity): Promise<ResultValue<string>>;
    generateRefreshToken(user: UserEntity): Promise<ResultValue<string>>;
  }
  export const TOKEN_SERVICE = Symbol('TokenService');