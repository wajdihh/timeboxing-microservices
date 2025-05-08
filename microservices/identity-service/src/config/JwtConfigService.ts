import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const JWT_CONFIG_KEYS = {
    secret: 'jwt.secret',
    refreshSecret: 'jwt.refreshSecret',
    expiresIn: 'jwt.expiresIn',
    refreshExpiresIn: 'jwt.refreshExpiresIn',
  } as const;
  
@Injectable()
export class JwtConfigService {
  constructor(private readonly config: ConfigService) {}

  getAccessSecret(): string {
    return this.config.getOrThrow<string>(JWT_CONFIG_KEYS.secret);
  }

  getRefreshSecret(): string {
    return this.config.getOrThrow<string>(JWT_CONFIG_KEYS.refreshSecret);
  }

  getAccessExpiresIn(): string {
    return this.config.get<string>(JWT_CONFIG_KEYS.expiresIn) || '15m';
  }

  getRefreshExpiresIn(): string {
    return this.config.get<string>(JWT_CONFIG_KEYS.refreshExpiresIn) || '7d';
  }
}
