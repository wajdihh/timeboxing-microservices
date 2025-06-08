import { AppModule } from '@identity/AppModule';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Metrics E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should record histogram data', async () => {
    
    // 1. Check /health
    await request(app.getHttpServer()).get('/health');

    // 2. Check /metrics
    const res = await request(app.getHttpServer()).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('http_request_duration_seconds_bucket');
    expect(res.text).toContain('http_request_duration_seconds_sum');
    expect(res.text).toContain('http_request_duration_seconds_count');
    expect(res.text).toContain('route="/health"');
  });
});