import { RedisService } from '@identity/infrastructure/redis/RedisService';
import { Test } from '@nestjs/testing';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';

describe('RedisService (Integration)', () => {
  let redisService: RedisService;
  let rawRedis: Redis;

  const testKey = 'test:key';
  const listKey = 'test:list:key';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        RedisModule.forRoot({
          config: {
            host: 'localhost',
            port: 6379,
          },
        }),
      ],
      providers: [RedisService],
    }).compile();

    redisService = moduleRef.get(RedisService);
    rawRedis = new Redis();
  });

  afterEach(async () => {
    await rawRedis.del(testKey);
    await rawRedis.del(listKey);
  });

  afterAll(async () => {
    await rawRedis.quit();
  });

  it('should set and get a value', async () => {
    await redisService.set(testKey, 'hello', 5);
    const value = await redisService.get(testKey);
    expect(value).toBe('hello');
  });

  it('should delete a key', async () => {
    await redisService.set(testKey, 'value');
    await redisService.del(testKey);
    const value = await redisService.get(testKey);
    expect(value).toBeNull();
  });

  it('should push and remove value from list', async () => {
    await redisService.pushToList(listKey, 'one');
    await redisService.pushToList(listKey, 'two');
    await redisService.deleteValueFromList(listKey, 'one');

    const result = await rawRedis.lrange(listKey, 0, -1);
    expect(result).toEqual(['two']);
  });

  it('should delete all values from a list with custom key resolver', async () => {
    await redisService.pushToList(listKey, 'session1');
    await redisService.pushToList(listKey, 'session2');

    await rawRedis.set('session:session1', 'value1');
    await rawRedis.set('session:session2', 'value2');

    await redisService.deleteAllValueFromList(listKey, (jti) => `session:${jti}`);

    const session1 = await rawRedis.get('session:session1');
    const session2 = await rawRedis.get('session:session2');
    expect(session1).toBeNull();
    expect(session2).toBeNull();
  });
});