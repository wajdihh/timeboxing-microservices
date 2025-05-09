import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from '@identity/domain/auth/TokenRepository';
import { ID, ResultValue } from '@timeboxing/shared';
import { InvalidRefreshTokenError } from '@identity/domain/auth/erros/InvalidRefreshTokenError';
import { JwtConfigService } from '@identity/config/JwtConfigService';
import { randomUUID } from 'crypto';

@Injectable()
export class TokenRepositoryAdapter implements TokenRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtConfig: JwtConfigService) { }

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

  async generateRefreshToken(userId: string): Promise<ResultValue<string>> {
    const token = this.jwtService.sign(
      { sub: userId },
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
      if (!payload?.sub) {
        return ResultValue.error(new InvalidRefreshTokenError());
      }

      const idResult = ID.from(payload.sub);
      if (idResult.isFail) return ResultValue.error(idResult.error);
      const idValue = idResult.unwrap();

      return ResultValue.ok(idValue);
    } catch {
      return ResultValue.error(new InvalidRefreshTokenError());
    }
  }

  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // TODO: store in Redis or in-memory cache or DB to manage multisession user and delete on logout to avoid resusibla token
    return;
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    // TODO: get from Redis or in-memory or DB to manage multisession user and delete on logout to avoid resusibla token
    return null;
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    // TODO: delete from Redis or cache or DB to manage multisession user and delete on logout to avoid resusibla token
    return;
  }
}
