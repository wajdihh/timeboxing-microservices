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
    private readonly redisService: RedisService) { }

  async generateAccessToken(userId: string, email: string): Promise<ResultValue<string>> {
    //jti to ensure that every token will differ even if generated in the same second (specially for jest tests)
    const token = this.jwtService.sign({ sub: userId, email: email, jti: randomUUID() },
      {
        secret: this.jwtConfig.getAccessSecret(),
        expiresIn: this.jwtConfig.getAccessExpiresIn(),
      }
    );
    return ResultValue.ok(token);
  }

  async generateRefreshToken(userId: string, sessionId: string): Promise<ResultValue<string>> {
    const token = this.jwtService.sign(
      { sub: userId, sid: sessionId },
      {
        secret: this.jwtConfig.getRefreshSecret(),
        expiresIn: this.jwtConfig.getRefreshExpiresIn(),
      }
    );
    return ResultValue.ok(token);
  }

  async verifyRefreshToken(token: string): Promise<ResultValue<ID>> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfig.getRefreshSecret(),
      });
      if (!payload?.sub || !payload?.sid) {
        return ResultValue.error(new InvalidRefreshTokenError());
      }

      const idResult = ID.from(payload.sub);
      if (idResult.isFail) return ResultValue.error(idResult.error);
      const userIdValue = idResult.unwrap();
      const sessionId = payload.sid;
      return ResultValue.ok({ userIdValue, sessionId });
    } catch {
      return ResultValue.error(new InvalidRefreshTokenError());
    }
  }

  async saveRefreshToken(userId: string, sessionId: string, refreshToken: string): Promise<void> {
    const key = RedisKeys.refreshSession(userId, sessionId);
    await this.redisService.set(key, refreshToken, this.jwtConfig.getRefreshTtlSeconds());
    return;
  }

  async getRefreshToken(userId: string, sessionId: string): Promise<string | null> {
    const key = RedisKeys.refreshSession(userId, sessionId);
    return await this.redisService.get(key);
  }

  async revokeRefreshToken(userId: string, sessionId: string): Promise<ResultValue<void>> {
    const key = RedisKeys.refreshSession(userId, sessionId);
    await this.redisService.del(key);
    return;
  }
}
