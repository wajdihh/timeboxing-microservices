import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createTestUserAndTokens } from './helpers/TestAuthUtil';
import { AppModule } from '@identity/AppModule';
import { RefreshStrategy } from '@identity/infrastructure/auth/strategies/RefreshStrategy';

describe('POST /auth/refresh', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 if x-refresh-token header is missing', async () => {
    const res = await request(app.getHttpServer()).post('/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('should return 401 if refresh token is malformed', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set(RefreshStrategy.headerKey, 'invalid.token.value')
    expect(res.status).toBe(401);
  });

  it('should return new access token for valid refresh token', async () => {
    const { tokens } = await createTestUserAndTokens(app);
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set(RefreshStrategy.headerKey, tokens.refreshToken)
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.accessToken).not.toBe(tokens.accessToken);
  });
});
