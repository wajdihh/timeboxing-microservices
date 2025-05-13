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
  
  getRefreshTtlSeconds(): number {
  const expiresIn = this.getRefreshExpiresIn().trim(); // e.g., '7d', '15m', '1h', '3600'

  // If it's just a number, assume it's in seconds
  if (/^\d+$/.test(expiresIn)) {
    return Number(expiresIn);
  }

  // Match formats like "15m", "7d", "1h"
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error(`Invalid refreshExpiresIn format: "${expiresIn}"`);
  }

  const [, value, unit] = match;
  const number = parseInt(value, 10);

  switch (unit) {
    case 's': return number;
    case 'm': return number * 60;
    case 'h': return number * 60 * 60;
    case 'd': return number * 60 * 60 * 24;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}
}
