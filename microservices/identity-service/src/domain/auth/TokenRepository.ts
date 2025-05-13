import { ID, ResultValue } from "@timeboxing/shared";

export interface TokenRepository {
    generateAccessToken(userId: string, email: string): Promise<ResultValue<string>>;
    generateRefreshToken(userId: string, sessionId: string): Promise<ResultValue<string>>;
    verifyRefreshToken(token: string): Promise<ResultValue<ID>>;
    saveRefreshToken(userId: string,sessionId: string, refreshToken: string): Promise<void>;
    getRefreshToken(userId: string, sessionId: string): Promise<string | null>;
    revokeRefreshToken(userId: string,sessionId: string): Promise<ResultValue<void>>;
  }
  export const TOKEN_REPOSITORY = Symbol('TokenRepository');