import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createTestUserAndTokens } from './helpers/TestAuthUtil';
import { AppModule } from '@identity/AppModule';
import { RefreshStrategy } from '@identity/infrastructure/auth/strategies/RefreshStrategy';
import { InvalidRefreshTokenError } from '@identity/domain/auth/errors/InvalidRefreshTokenError';

jest.setTimeout(60000);

describe('AuthController (e2e) - /auth/logout', () => {
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

  it('should logout a user and increment the logout metric', async () => {
    const { tokens } = await createTestUserAndTokens(app);

    // Act - logout
    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set(RefreshStrategy.headerKey, tokens.refreshToken);

    // Assert - successful logout
    expect(res.status).toBe(204); // or 200 depending on your implementation

    // Act - fetch /metrics
    const metricsRes = await request(app.getHttpServer())
      .get('/metrics');

    // Assert - metric incremented
    expect(metricsRes.status).toBe(200);
    expect(metricsRes.text).toContain('identity_logouts_total{method="POST"}');
  });

  it('should return 401 if x-refresh-token header is missing', async () => {
    const res = await request(app.getHttpServer()).post('/auth/refresh');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe(InvalidRefreshTokenError.name);
  });

  it('should return 401 if refresh token is malformed', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set(RefreshStrategy.headerKey, 'invalid.token.value');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe(InvalidRefreshTokenError.name);
  });

  it('should return 401 if refresh token is invalid', async () => {
    const { tokens } = await createTestUserAndTokens(app);
    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set(RefreshStrategy.headerKey, tokens.refreshToken + '1');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe(InvalidRefreshTokenError.name);
  });
});