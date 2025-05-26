import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from '@identity/domain/auth/TokenRepository';
import { ID, ResultValue } from '@timeboxing/shared';
import { InvalidRefreshTokenError } from '@identity/domain/auth/erros/InvalidRefreshTokenError';
import { JwtConfigService } from '@identity/config/JwtConfigService';
import { randomUUID } from 'crypto';
import { RedisService } from '../redis/RedisService';
import { RedisKeys } from '../redis/RedisKeysValue';

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
    const jtiGenerated = randomUUID();
    console.log('### on ACESS jtiGenerated', jtiGenerated);
    const token = this.jwtService.sign({ sub: userId, email: email, jti: jtiGenerated },
      {
        secret: this.jwtConfig.getAccessSecret(),
        expiresIn: this.jwtConfig.getAccessExpiresIn(),
      }
    );
    return ResultValue.ok(token);
  }

  async generateRefreshToken(userId: string): Promise<ResultValue<string>> {
    const jtiGenerated = randomUUID();
    console.log('### on REFRESH jtiGenerated', jtiGenerated);
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

  async verifyRefreshToken(token: string): Promise<ResultValue<ID>> {
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
        return ResultValue.error(new InvalidRefreshTokenError());
      }

      const idResult = ID.from(payload.sub);
      if (idResult.isFail) return ResultValue.error(idResult.error);
      const userIdValue = idResult.unwrap();
      return ResultValue.ok(userIdValue);
    } catch {
      return ResultValue.error(new InvalidRefreshTokenError());
    }
  }


  async revokeRefreshToken(userId: string, sessionId: string): Promise<ResultValue<void>> {
    const sessionKeyAssosciatedToTheRefreshToken = RedisKeys.jtiSessionKey(sessionId);
    await this.redisService.deleteValueFromList(sessionKeyAssosciatedToTheRefreshToken, userId);
    return ResultValue.ok();
  }

  async revokeAllRefreshToken(userId: string): Promise<ResultValue<void>> {
    //Delete all sessions
    const userSessionsKey = RedisKeys.userSessionsKey(userId);
    await this.redisService.deleteAllValueFromList(userSessionsKey, (jti) =>  RedisKeys.jtiSessionKey(jti));
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
    const key = RedisKeys.jtiSessionKey(jti);
    const sessionId = await this.getSessionId(userId);
    return sessionId === key;
  }
  private async getSessionId(userId: string): Promise<string | null> {
    const key = RedisKeys.jtiSessionKey(userId);
    return await this.redisService.get(key);
  }

  private async saveSessionId(userId: string, sessionId: string): Promise<void> {
     const sessionKey = RedisKeys.jtiSessionKey(sessionId);
     const userSessionsKey = RedisKeys.userSessionsKey(userId);
     await this.redisService.pushToList(userSessionsKey, sessionKey);
    return;
  }
}
