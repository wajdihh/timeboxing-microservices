import { Injectable } from '@nestjs/common';
import { RedisService as NestRedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {

  private readonly redisClient: Redis;
  private maxSessions = 5;


  constructor(private readonly redisService: NestRedisService) {
    this.redisClient = this.redisService.getOrThrow('default');
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  setSessionLimit(limit: number): void {
    if (limit < 1) throw new Error('maxSessions must be >= 1');
    this.maxSessions = limit;
  }
  /**
   * Push a value to a redis list identified by the key.
   *
   * @remarks
   * The value is added to the head of the list.
   *
   * @param key The key identifying the list.
   * @param value The value to push.
   * 
   * Exp Result : 
   * key = sessions:3e9db22a-f1e6-4c52-a1a3-50e5f209b763
   * value = [jti1, jti2, jti3, ...]
   */
  async pushToList(key: string, value: string): Promise<void> {
    await this.redisClient.lpush(key, value);
    await this.redisClient.ltrim(key, 0, this.maxSessions - 1); // optional limit
  }

  /**
   * Delete all values from a list identified by the key.
   *
   * @param listKey The key identifying the list.
   * @param elementKey A function that takes a value from the list and returns the key
   * to delete the item from the db.
   *
   * @example
   * To delete all sessions for a user:
   */
  async deleteAllValueFromList(listKey: string, elementKey: (key: string) => string): Promise<void> {
    const items = await this.redisClient.lrange(listKey, 0, -1);
    await Promise.all(items.map(item => this.redisClient.del(elementKey(item))));
    await this.redisClient.del(listKey);
  }

  async deleteValueFromList(listKey: string, value: string): Promise<void> {
    await this.redisClient.lrem(listKey, 0, value); // 0 delete all occurences
  }

}
