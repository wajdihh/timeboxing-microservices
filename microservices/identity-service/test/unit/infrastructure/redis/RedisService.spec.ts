import { RedisService } from '@identity/infrastructure/redis/RedisService';
import { RedisService as NestRedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

// Create a mock for the ioredis client
// We need to define all methods that our RedisService will call on the client.
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  quit: jest.fn(),
  del: jest.fn(),
  lrange: jest.fn(),
  lpush: jest.fn(),
  ltrim: jest.fn(),
  lrem: jest.fn(),
} as unknown as jest.Mocked<Redis>;

// Mock NestRedisService
// We only need to mock getOrThrow for the 'default' client.
const mockNestRedisService = {
  getOrThrow: jest.fn().mockImplementation((name: string) => {
    if (name === 'default') {
      return mockRedisClient;
    }
    throw new Error(`Client ${name} not found`);
  }),
} as unknown as jest.Mocked<NestRedisService>;


describe('RedisService', () => {
  let service: RedisService;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    service = new RedisService(mockNestRedisService);
  });

  describe('constructor', () => {
    it('should get the default redis client from NestRedisService', () => {
      
      expect(mockNestRedisService.getOrThrow).toHaveBeenCalledWith('default');
    });
  });

  describe('get', () => {
    it('should call redisClient.get with the key and return its result', async () => {
      const key = 'testKey';
      const expectedValue = 'testValue';
      mockRedisClient.get.mockResolvedValue(expectedValue);

      const result = await service.get(key);

      expect(result).toBe(expectedValue);
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
    });

    it('should return null if redisClient.get returns null', async () => {
      const key = 'nonExistentKey';
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get(key);

      expect(result).toBeNull();
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
    });
  });

  describe('set', () => {
    it('should call redisClient.set without TTL if ttlSeconds is not provided', async () => {
      const key = 'testKey';
      const value = 'testValue';
      mockRedisClient.set.mockResolvedValue('OK'); // 'OK' is a common response for set

      await service.set(key, value);

      expect(mockRedisClient.set).toHaveBeenCalledWith(key, value);
      expect(mockRedisClient.set).not.toHaveBeenCalledWith(key, value, 'EX', expect.any(Number));
    });

    it('should call redisClient.set with EX and ttlSeconds if provided', async () => {
      const key = 'testKey';
      const value = 'testValue';
      const ttlSeconds = 3600;
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set(key, value, ttlSeconds);

      expect(mockRedisClient.set).toHaveBeenCalledWith(key, value, 'EX', ttlSeconds);
    });
  });
});
