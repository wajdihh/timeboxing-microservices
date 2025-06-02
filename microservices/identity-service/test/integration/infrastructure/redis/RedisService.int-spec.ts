import { RedisService } from '@identity/infrastructure/redis/RedisService';
import { RedisService as NestRedisService } from '@liaoliaots/nestjs-redis';
import { GenericContainer, type StartedTestContainer } from 'testcontainers'; // Removed StartedNetwork
import { Redis as IoRedisClient } from 'ioredis';

describe('RedisService Integration Tests', () => {
  let redisContainer: StartedTestContainer;
  let redisClient: IoRedisClient;
  let service: RedisService;
  // let network: StartedNetwork; // Removed as it's currently unused


  beforeAll(async () => {
    // Testcontainers might take a moment to start, especially the first time.
    // Consider increasing Jest timeout for this test suite if needed.
    // jest.setTimeout(60000); // e.g., 60 seconds

    // Create a custom network for the Redis container (optional but good practice)
    // network = await new Network().start();

    redisContainer = await new GenericContainer('redis:alpine')
      .withExposedPorts(6379)
      // .withNetwork(network) // Attach to custom network if created
      .start();

    const host = redisContainer.getHost();
    const port = redisContainer.getMappedPort(6379);

    redisClient = new IoRedisClient({
      host: host,
      port: port,
      // Add other ioredis options if necessary, e.g., password if your Redis image uses one
    });

    // Wait for Redis client to be ready (optional, but can prevent flaky tests)
    await new Promise<void>((resolve, reject) => {
      redisClient.on('ready', resolve);
      redisClient.on('error', reject); // Handle connection errors
    });
    
    // Mock NestRedisService to provide our test ioredis client
    const mockNestRedisService = {
      getOrThrow: jest.fn().mockImplementation((name: string) => {
        if (name === 'default') {
          return redisClient;
        }
        throw new Error(`Test mock: Client ${name} not found`);
      }),
    } as unknown as jest.Mocked<NestRedisService>;

    service = new RedisService(mockNestRedisService);
  }, 60000); // Increase timeout for beforeAll if container startup is slow

  afterAll(async () => {
    if (redisClient && redisClient.status !== 'end' && redisClient.status !== 'close') {
      // Only attempt to quit if the client is not already in a terminal state ('end' or 'close')
      try {
        await redisClient.quit();
      } catch (error) {
        // Log error if quit fails, but don't let it fail the test suite teardown
        console.error('Error during redisClient.quit() in afterAll:', error);
      }
    }
    if (redisContainer) {
      await redisContainer.stop();
    }
    // if (network) {
    //   await network.stop();
    // }
  });

  beforeEach(async () => {
    // Clear all data from Redis before each test
    if (redisClient) {
      await redisClient.flushall();
    }
  });

  describe('set and get', () => {
    it('should set a value and then get it back', async () => {
      const key = 'integrationTestKey';
      const value = 'integrationTestValue';

      await service.set(key, value);
      const retrievedValue = await service.get(key);

      expect(retrievedValue).toBe(value);
    });

    it('should set a value with TTL and see it expire (conceptual - actual expiry test is hard)', async () => {
      const key = 'ttlTestKey';
      const value = 'ttlTestValue';
      const ttlSeconds = 1; // Short TTL for testing (actual wait might be flaky)

      await service.set(key, value, ttlSeconds);
      let retrievedValue = await service.get(key);
      expect(retrievedValue).toBe(value);

      // Wait for TTL to expire - this can make tests slow and flaky.
      // For real TTL tests, specific Redis commands or time manipulation might be needed.
      // This is a simplified version.
      await new Promise(resolve => setTimeout(resolve, (ttlSeconds * 1000) + 500)); // Wait a bit longer than TTL
      
      retrievedValue = await service.get(key);
      expect(retrievedValue).toBeNull();
    });

    it('get should return null for a non-existent key', async () => {
        const key = 'nonExistentKeyForGet';
        const retrievedValue = await service.get(key);
        expect(retrievedValue).toBeNull();
      });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      const key = 'keyToDelete';
      const value = 'valueToDelete';
      await service.set(key, value);
      expect(await service.get(key)).toBe(value); // Verify it's set

      await service.del(key);
      expect(await service.get(key)).toBeNull(); // Verify it's deleted
    });
  });

  describe('list operations', () => {
    it('should push to list and get list back with lrange', async () => {
      const listKey = 'myIntegrationList';
      await service.pushToList(listKey, 'value1');
      await service.pushToList(listKey, 'value2'); // Pushes to head, so value2, value1

      const list = await service.getValueByKeyFromList(listKey);
      expect(list).toEqual(['value2', 'value1']);
    });

    it('getValueByKeyFromList should correctly report contained and not contained values', async () => {
      const listKey = 'checkContainsList';
      await service.pushToList(listKey, 'alpha');
      await service.pushToList(listKey, 'beta'); // List: ['beta', 'alpha']
      
      const listValues = await service.getValueByKeyFromList(listKey);
      expect(listValues).toContain('alpha');
      expect(listValues).toContain('beta');
      expect(listValues).not.toContain('gamma');
    });

    it('pushToList should respect maxSessions limit set by setSessionLimit', async () => {
      const listKey = 'limitedList';
      const limit = 3;
      service.setSessionLimit(limit); // Default is 5 in RedisService

      for (let i = 1; i <= limit + 2; i++) { // Push 5 items
        await service.pushToList(listKey, `item${i}`);
      }

      const list = await service.getValueByKeyFromList(listKey);
      expect(list.length).toBe(limit);
      // lpush adds to head, ltrim keeps from head. So, latest 'limit' items.
      expect(list).toEqual([`item${limit + 2}`, `item${limit + 1}`, `item${limit}`]);
    });

    it('deleteValueFromList should remove a specific value from the list', async () => {
      const listKey = 'listToDeleteFrom';
      await service.pushToList(listKey, 'value1');
      await service.pushToList(listKey, 'valueToBeDeleted');
      await service.pushToList(listKey, 'value2');
      // List is now: ['value2', 'valueToBeDeleted', 'value1']
      
      await service.deleteValueFromList(listKey, 'valueToBeDeleted');
      
      const list = await service.getValueByKeyFromList(listKey);
      expect(list).toEqual(['value2', 'value1']);
      expect(list).not.toContain('valueToBeDeleted');
    });

    it('deleteAllValueFromList should delete the list and associated item keys', async () => {
      const listKey = 'user:123:sessions';
      // Simulate session IDs (jtis) being stored in the list
      const sessionJtis = ['jti1', 'jti2', 'jti3'];
      for (const jti of sessionJtis) {
        await service.pushToList(listKey, jti);
        // Simulate storing actual session data elsewhere, keyed by the jti
        await service.set(`session:${jti}`, `sessionDataFor${jti}`);
      }

      // Verify setup
      expect((await service.getValueByKeyFromList(listKey)).length).toBe(sessionJtis.length);
      expect(await service.get(`session:${sessionJtis[0]}`)).toBeDefined();

      // Function to map list item (jti) to the key of the actual session data
      const elementKeyFn = (jti: string) => `session:${jti}`;
      
      await service.deleteAllValueFromList(listKey, elementKeyFn);

      // Verify list is deleted
      expect((await service.getValueByKeyFromList(listKey)).length).toBe(0);
      // Verify associated session data is deleted
      for (const jti of sessionJtis) {
        expect(await service.get(`session:${jti}`)).toBeNull();
      }
    });
  });
  
  describe('setSessionLimit error case', () => {
    it('should throw an error if limit is less than 1', () => {
      expect(() => service.setSessionLimit(0)).toThrow('maxSessions must be >= 1');
      expect(() => service.setSessionLimit(-5)).toThrow('maxSessions must be >= 1');
    });
  });

  describe('quit', () => {
    // This test is a bit more involved as it changes the state of the client.
    // It might be better to run this test in isolation or ensure client re-creation if needed.
    // However, our afterAll already handles quitting.
    it('should close the connection, and subsequent operations should fail or indicate closure', async () => {
      // Ensure client is connected first by performing a simple operation
      await service.set('beforeQuitKey', 'value');
      expect(await service.get('beforeQuitKey')).toBe('value');

      await service.quit(); // This calls redisClient.quit()

      // After quit, operations on the same client instance should ideally fail.
      // ioredis might throw an error or commands might just not complete.
      // Let's try a 'get' and expect an error.
      try {
        await service.get('afterQuitKey');
        // If it doesn't throw, it's unexpected for a closed client in many scenarios.
        // However, ioredis might have auto-reconnect logic that could interfere with this test.
        // For a simple test, we check if the client status indicates it's not 'ready' or 'connect'.
        // The 'status' property is available on ioredis client.
        expect(redisClient.status).not.toBe('ready');
        expect(redisClient.status).not.toBe('connect');
        // A more robust test might involve checking if commands error out with "Connection is closed"
        // or similar, but this depends on ioredis behavior after quit and potential auto-reconnect.
      } catch (error: unknown) {
        // Expect an error indicating the connection is closed or commands can't be processed.
        // Common error messages include "Connection is closed" or "Stream isn't writeable".
        expect((error as Error).message).toMatch(/closed|Stream isn't writeable/i);
      }
      // Note: The afterAll hook will attempt to quit the client again.
      // ioredis client's quit method is usually idempotent or handles this gracefully.
    });
  });
});
