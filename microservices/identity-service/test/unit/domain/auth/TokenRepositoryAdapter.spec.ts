import { JwtService } from '@nestjs/jwt';
import { JwtConfigService } from '@identity/config/JwtConfigService';
import { RedisService } from '@identity/infrastructure/redis/RedisService';
import { InvalidRefreshTokenError } from '@identity/domain/auth/errors/InvalidRefreshTokenError';
import { TokenRepositoryAdapter } from '@identity/infrastructure/auth/TokenRepositoryAdapter';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ID } from '@timeboxing/shared';
import { InvalidSessionError } from '@identity/domain/auth/errors/InvalidSessionError';

jest.mock('@nestjs/jwt');
jest.mock('@identity/config/JwtConfigService');
jest.mock('@identity/infrastructure/redis/RedisService');

describe('TokenRepositoryAdapter', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const sessionId = '123e4567-e89b-12d3-a456-426614174001';

  let tokenRepo: TokenRepositoryAdapter;
  let jwtService: jest.Mocked<JwtService>;
  let jwtConfig: jest.Mocked<JwtConfigService>;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtService,
        JwtConfigService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'jwt.secret') return 'access-secret';
              if (key === 'jwt.refreshSecret') return 'refresh-secret';
              throw new Error(`Unknown config key: ${key}`);
            }),
          },
        },
        {
          provide: RedisService,
          useValue: {
            setSessionLimit: jest.fn(),
            pushToList: jest.fn(),
            getValueByKeyFromList: jest.fn(),
            deleteValueFromList: jest.fn(),
            del: jest.fn(),
            deleteAllValueFromList: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtService = moduleRef.get(JwtService);
    jwtConfig = moduleRef.get(JwtConfigService);
    (jwtConfig.getAccessSecret as jest.Mock).mockReturnValue('access-secret');
    (jwtConfig.getAccessExpiresIn as jest.Mock).mockReturnValue('1h');
    (jwtConfig.getRefreshSecret as jest.Mock).mockReturnValue('refresh-secret');
    (jwtConfig.getRefreshExpiresIn as jest.Mock).mockReturnValue('7d');
    redisService = moduleRef.get(RedisService);

    tokenRepo = new TokenRepositoryAdapter(jwtService, jwtConfig, redisService);
  });

  it('should initialize with session limit of 5', () => {
    expect(redisService.setSessionLimit).toHaveBeenCalledWith(5);
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      jwtService.sign = jest.fn().mockReturnValue('mockedAccessToken');
      const result = await tokenRepo.generateAccessToken(userId, 'test@example.com');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: userId,
          email: 'test@example.com',
          jti: expect.any(String),
        }),
        {
          secret: 'access-secret',
          expiresIn: '1h',
        }
      );

      expect(result.isOk).toBe(true);
      expect(result.unwrap()).toBe('mockedAccessToken');
    });

    it('should handle JWT sign errors', async () => {
      jwtService.sign = jest.fn().mockImplementation(() => {
        throw new Error('JWT error');
      });
      const result = await tokenRepo.generateAccessToken(userId, 'test@example.com');
      expect(result.isFail).toBe(true);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token and save session', async () => {
      jwtService.sign = jest.fn().mockReturnValue('mockedRefreshToken');
      redisService.pushToList = jest.fn();

      const result = await tokenRepo.generateRefreshToken(userId);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: userId,
          jti: expect.any(String),
        }),
        {
          secret: 'refresh-secret',
          expiresIn: '7d',
        }
      );

      expect(redisService.pushToList).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );

      expect(result.isOk).toBe(true);
      expect(result.unwrap()).toBe('mockedRefreshToken');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify refresh token successfully', async () => {
      jwtService.verifyAsync = jest.fn().mockResolvedValue({
        sub: userId,
        jti: sessionId,
      });
      redisService.getValueByKeyFromList = jest.fn().mockResolvedValue([`session:${sessionId}`]);

      const result = await tokenRepo.verifyRefreshToken('mockedToken');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('mockedToken', {
        secret: 'refresh-secret',
      });

      expect(result.isOk).toBe(true);
      const value = result.unwrap();
      expect(value.userId).toBeInstanceOf(ID);
      expect(value.userId.value).toBe(userId);
      expect(value).toHaveProperty('sessionID', sessionId);
    });

    it('should fail if JWT is missing sub or jti', async () => {
      jwtService.verifyAsync = jest.fn().mockResolvedValue({});
      const result = await tokenRepo.verifyRefreshToken('invalidToken');
      expect(result.isFail).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidRefreshTokenError);
    });

    it('should fail if session not active', async () => {
      jwtService.verifyAsync = jest.fn().mockResolvedValue({
        sub: userId,
        jti: sessionId,
      });
      redisService.getValueByKeyFromList = jest.fn().mockResolvedValue(['session:other-session']);

      const result = await tokenRepo.verifyRefreshToken('invalidToken');
      expect(result.isFail).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidSessionError);
    });

    it('should fail if ID.from fails', async () => {
      jwtService.verifyAsync = jest.fn().mockResolvedValue({
        sub: 'invalid-id',
        jti: sessionId,
      });
      redisService.getValueByKeyFromList = jest.fn().mockResolvedValue([`session:${sessionId}`]);

      const result = await tokenRepo.verifyRefreshToken('invalidToken');
      expect(result.isFail).toBe(true);
    });

    it('should verify Redis key patterns', async () => {
      jwtService.verifyAsync = jest.fn().mockResolvedValue({
        sub: userId,
        jti: sessionId,
      });
      redisService.getValueByKeyFromList = jest.fn().mockImplementation((key) => {
        expect(key).toMatch(new RegExp(`^user:${userId}:sessions$`));
        return [`session:${sessionId}`];
      });

      const result = await tokenRepo.verifyRefreshToken('mockedToken');
      expect(result.isOk).toBe(true);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should call deleteValueFromList', async () => {
      redisService.deleteValueFromList = jest.fn();
      const result = await tokenRepo.revokeRefreshToken(userId, sessionId);

      expect(redisService.deleteValueFromList).toHaveBeenCalled();
      expect(result.isOk).toBe(true);
    });
  });

  describe('revokeAllRefreshToken', () => {
    it('should call deleteAllValueFromList', async () => {
      redisService.deleteAllValueFromList = jest.fn();
      const result = await tokenRepo.revokeAllRefreshToken(userId);

      expect(redisService.deleteAllValueFromList).toHaveBeenCalled();
      expect(result.isOk).toBe(true);
    });

    it('should verify Redis key patterns', async () => {
      redisService.deleteAllValueFromList = jest.fn().mockImplementation((key) => {
        expect(key).toMatch(new RegExp(`^user:${userId}:sessions$`));
      });
      await tokenRepo.revokeAllRefreshToken(userId);
    });
  });

  describe('isRefreshTokenHasActiveSession', () => {
    it('should return true if session is active', async () => {
      redisService.getValueByKeyFromList = jest.fn().mockResolvedValue([`session:${sessionId}`]);
      const result = await tokenRepo['isRefreshTokenHasActiveSession'](userId, sessionId);
      expect(result).toBe(true);
    });

    it('should return false if session is not active', async () => {
      redisService.getValueByKeyFromList = jest.fn().mockResolvedValue(['session:other-session']);
      const result = await tokenRepo['isRefreshTokenHasActiveSession'](userId, sessionId);
      expect(result).toBe(false);
    });

    it('should verify Redis key patterns', async () => {
      redisService.getValueByKeyFromList = jest.fn().mockImplementation((key) => {
        expect(key).toMatch(new RegExp(`^user:${userId}:sessions$`));
        return [`session:${sessionId}`];
      });
      await tokenRepo['isRefreshTokenHasActiveSession'](userId, sessionId);
    });
  });

  describe('private methods', () => {
    it('saveSessionId should use correct Redis keys', async () => {
      redisService.pushToList = jest.fn().mockImplementation((key, value) => {
        expect(key).toMatch(new RegExp(`^user:${userId}:sessions$`));
        expect(value).toMatch(new RegExp(`^session:${sessionId}$`));
      });
      await tokenRepo['saveSessionId'](userId, sessionId);
    });

    it('getSessionsId should use correct Redis key', async () => {
      redisService.getValueByKeyFromList = jest.fn().mockImplementation((key) => {
        expect(key).toMatch(new RegExp(`^user:${userId}:sessions$`));
        return [`session:${sessionId}`];
      });
      await tokenRepo['getSessionsId'](userId);
    });
  });
});
