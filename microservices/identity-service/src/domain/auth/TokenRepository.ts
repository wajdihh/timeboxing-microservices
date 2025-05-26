import { ID, ResultValue } from "@timeboxing/shared";

export interface TokenRepository {
    generateAccessToken(userId: string, email: string): Promise<ResultValue<string>>;
    generateRefreshToken(userId: string): Promise<ResultValue<string>>;
    verifyRefreshToken(token: string): Promise<ResultValue<ID>>;
    revokeRefreshToken(userId: string, sessionId: string): Promise<ResultValue<void>>;
    revokeAllRefreshToken(userId: string): Promise<ResultValue<void>>;
  }
  export const TOKEN_REPOSITORY = Symbol('TokenRepository');