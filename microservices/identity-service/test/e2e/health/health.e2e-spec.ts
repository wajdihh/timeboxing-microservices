import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest'; // Changed import
import { AppModule } from '../../../src/AppModule';
import { PrismaService } from '../../../src/infrastructure/prisma/PrismaService';
import { RedisService } from '../../../src/infrastructure/redis/RedisService';

describe('HealthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let redisService: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    redisService = moduleFixture.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return 200 OK with status "ok"', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(HttpStatus.OK)
        .expect({ status: 'ok' });
    });
  });

  describe('/health/ready (GET)', () => {
    it('should return 200 OK with status "ready" and dependencies "ok" when all are healthy', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prismaSpy = jest.spyOn(prismaService, '$queryRaw' as any).mockResolvedValue(Promise.resolve());
      const redisSpy = jest.spyOn(redisService, 'ping').mockResolvedValue('PONG');

      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        status: 'ready',
        dependencies: {
          database: { status: 'ok' },
          redis: { status: 'ok' },
        },
      });

      expect(prismaSpy).toHaveBeenCalled();
      expect(redisSpy).toHaveBeenCalled();

      prismaSpy.mockRestore();
      redisSpy.mockRestore();
    });

    it('should return 503 SERVICE_UNAVAILABLE if database check fails', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prismaSpy = jest.spyOn(prismaService, '$queryRaw' as any).mockRejectedValue(new Error('DB connection failed'));
      const redisSpy = jest.spyOn(redisService, 'ping').mockResolvedValue('PONG');

      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(HttpStatus.SERVICE_UNAVAILABLE);
      
      expect(response.body.status).toEqual('not_ready');
      expect(response.body.dependencies.database.status).toEqual('error');
      expect(response.body.dependencies.database.error).toEqual('DB connection failed');
      expect(response.body.dependencies.redis.status).toEqual('ok');


      prismaSpy.mockRestore();
      redisSpy.mockRestore();
    });

    it('should return 503 SERVICE_UNAVAILABLE if redis check fails (returns not PONG)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prismaSpy = jest.spyOn(prismaService, '$queryRaw' as any).mockResolvedValue(Promise.resolve());
      const redisSpy = jest.spyOn(redisService, 'ping').mockResolvedValue('WRONG_PONG'); // Simulate incorrect response

      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(HttpStatus.SERVICE_UNAVAILABLE);

      expect(response.body.status).toEqual('not_ready');
      expect(response.body.dependencies.database.status).toEqual('ok');
      expect(response.body.dependencies.redis.status).toEqual('error');
      expect(response.body.dependencies.redis.error).toEqual('Expected PONG, got WRONG_PONG');

      prismaSpy.mockRestore();
      redisSpy.mockRestore();
    });
    
    it('should return 503 SERVICE_UNAVAILABLE if redis ping throws an error', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prismaSpy = jest.spyOn(prismaService, '$queryRaw' as any).mockResolvedValue(Promise.resolve());
      const redisSpy = jest.spyOn(redisService, 'ping').mockRejectedValue(new Error('Redis connection failed'));

      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(HttpStatus.SERVICE_UNAVAILABLE);

      expect(response.body.status).toEqual('not_ready');
      expect(response.body.dependencies.database.status).toEqual('ok');
      expect(response.body.dependencies.redis.status).toEqual('error');
      expect(response.body.dependencies.redis.error).toEqual('Redis connection failed');

      prismaSpy.mockRestore();
      redisSpy.mockRestore();
    });

    it('should return 503 SERVICE_UNAVAILABLE if both checks fail', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prismaSpy = jest.spyOn(prismaService, '$queryRaw' as any).mockRejectedValue(new Error('DB connection failed'));
        const redisSpy = jest.spyOn(redisService, 'ping').mockRejectedValue(new Error('Redis connection failed'));
  
        const response = await request(app.getHttpServer())
          .get('/health/ready')
          .expect(HttpStatus.SERVICE_UNAVAILABLE);
        
        expect(response.body.status).toEqual('not_ready');
        expect(response.body.dependencies.database.status).toEqual('error');
        expect(response.body.dependencies.database.error).toEqual('DB connection failed');
        expect(response.body.dependencies.redis.status).toEqual('error');
        expect(response.body.dependencies.redis.error).toEqual('Redis connection failed');

        prismaSpy.mockRestore();
        redisSpy.mockRestore();
      });
  });
});
