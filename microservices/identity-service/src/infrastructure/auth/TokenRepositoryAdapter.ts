import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from '@identity/domain/auth/TokenRepository';
import { ID, ResultValue } from '@timeboxing/shared';
import { InvalidRefreshTokenError } from '@identity/domain/auth/errors/InvalidRefreshTokenError';
import { JwtConfigService } from '@identity/config/JwtConfigService';
import { randomUUID } from 'crypto';
import { RedisService } from '../redis/RedisService';
import { RedisKeys } from '../redis/RedisKeysValue';
import { InvalidSessionError } from '@identity/domain/auth/errors/InvalidSessionError';

@Injectable()
export class TokenRepositoryAdapter implements TokenRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtConfig: JwtConfigService,
    private readonly redisService: RedisService) { 
      this.redisService.setSessionLimit(5);
    }
  

  async generateAccessToken(userId: string, email: string): Promise<ResultValue<string>> {
    //jti to ensure that every token will differ even if generated in the same second (specially for jest tests)
    try {
    const jtiGenerated = randomUUID();
    const token = this.jwtService.sign(
      { sub: userId, email: email, jti: jtiGenerated },
      {
        secret: this.jwtConfig.getAccessSecret(),
        expiresIn: this.jwtConfig.getAccessExpiresIn(),
      }
    );
    return ResultValue.ok(token);
  } catch (error) {
    return ResultValue.error(error as Error);
  }
  }

  async generateRefreshToken(userId: string): Promise<ResultValue<string>> {
    const jtiGenerated = randomUUID();
    const token = this.jwtService.sign(
      { sub: userId, jti: jtiGenerated },
      {
        secret: this.jwtConfig.getRefreshSecret(),
        expiresIn: this.jwtConfig.getRefreshExpiresIn(),
      }
    );

    await this.saveSessionId(userId, jtiGenerated);

    return ResultValue.ok(token);
  }

  async verifyRefreshToken(token: string): Promise<ResultValue<{userId: ID, sessionID: string}>> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfig.getRefreshSecret(),
      });
      if (!payload?.sub || !payload?.jti) {
        return ResultValue.error(new InvalidRefreshTokenError());
      }

      const userId = payload.sub;
      const sessionId = payload.jti;
      const isSessionValide = await this.isRefreshTokenHasActiveSession(userId, sessionId);

      if (!isSessionValide) {
        return ResultValue.error(new InvalidSessionError());
      }

      const idResult = ID.from(payload.sub);
      if (idResult.isFail) return ResultValue.error(idResult.error);
      const userIdValue = idResult.unwrap();
      return ResultValue.ok({userId: userIdValue, sessionID: sessionId});
    } catch {
      return ResultValue.error(new InvalidRefreshTokenError());
    }
  }


  async revokeRefreshToken(userId: string, sessionId: string): Promise<ResultValue<void>> {
    const sessionKey = RedisKeys.sessionKey(sessionId);
    const userSessionsKey = RedisKeys.userSessionsKey(userId);
    
    // Delete the session key from Redis
    await this.redisService.del(sessionKey);
    // Remove the session key from user's sessions list
    await this.redisService.deleteValueFromList(userSessionsKey, sessionKey);
    
    return ResultValue.ok();
  }

  async revokeAllRefreshToken(userId: string): Promise<ResultValue<void>> {
    //Delete all sessions
    const userSessionsKey = RedisKeys.userSessionsKey(userId);
    await this.redisService.deleteAllValueFromList(userSessionsKey, (jti) =>  RedisKeys.sessionKey(jti));
    return ResultValue.ok();
  }

  /**
   * jti is exracted from refresh token, if it is the same as the current session id, then the refresh token is still valid
   * it's a way to not store refresh token in memory
   * @param userId 
   * @param jti (SessionID)
   * @returns 
   */
  private async isRefreshTokenHasActiveSession(userId: string, jti: string): Promise<boolean> {
    const sessions = await this.getSessionsId(userId);
    if (!sessions) return false;
    
    // Check if any session in the list matches this jti
    return sessions.some(session => session.endsWith(jti));
  }
  private async getSessionsId(userId: string): Promise<string[] | null> {
    const key = RedisKeys.userSessionsKey(userId);
    return await this.redisService.getValueByKeyFromList(key);
  }

  private async saveSessionId(userId: string, sessionId: string): Promise<void> {
     const sessionKey = RedisKeys.sessionKey(sessionId);
     const userSessionsKey = RedisKeys.userSessionsKey(userId);
     await this.redisService.pushToList(userSessionsKey, sessionKey);
    return;
  }
}
