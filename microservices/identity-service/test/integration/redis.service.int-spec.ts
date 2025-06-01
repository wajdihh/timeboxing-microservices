import { RedisService } from '@identity/infrastructure/redis/RedisService';
import { Test } from '@nestjs/testing';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule } from '@nestjs/config';

describe('RedisService (Integration)', () => {
  let redisService: RedisService;

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
  });

  afterEach(async () => {
    await redisService.del(testKey);
    await redisService.del(listKey);
  });

  afterAll(async () => {
    await redisService.quit();
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

    const result = await redisService.getValueByKeyFromList(listKey);
    expect(result).toEqual(['two']);
  });

  it('should push and get a value from list', async () => {
    await redisService.pushToList(listKey, 'session1');
    const listValues = await redisService.getValueByKeyFromList(listKey);
    expect(listValues).toContain('session1');
  });

    it('should push and check if value exists for a given key', async () => {
    await redisService.pushToList(listKey, 'session1');
    await redisService.pushToList(listKey, 'session2');
    await redisService.pushToList(listKey, 'session3');

    const listValues = await redisService.getValueByKeyFromList(listKey);
    expect(listValues).not.toContain('session5');
    expect(listValues).toContain('session2');
  });

  it('should delete all values from a list with custom key resolver', async () => {
    await redisService.pushToList(listKey, 'session1');
    await redisService.pushToList(listKey, 'session2');

    await redisService.set('session:session1', 'value1');
    await redisService.set('session:session2', 'value2');

    await redisService.deleteAllValueFromList(listKey, (jti) => `session:${jti}`);

    const session1 = await redisService.get('session:session1');
    const session2 = await redisService.get('session:session2');
    expect(session1).toBeNull();
    expect(session2).toBeNull();
  });
});