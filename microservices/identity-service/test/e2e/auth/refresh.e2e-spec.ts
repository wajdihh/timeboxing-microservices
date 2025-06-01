import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createTestUserAndTokens } from './helpers/TestAuthUtil';
import { AppModule } from '@identity/AppModule';
import { RefreshStrategy } from '@identity/infrastructure/auth/strategies/RefreshStrategy';
import { UserFactory } from '@timeboxing/shared';

jest.setTimeout(60000);

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

describe('POST /auth/refresh', () => {
  it('should return 401 if x-refresh-token header is missing', async () => {
    const res = await request(app.getHttpServer()).post('/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('should return 401 if refresh token is malformed', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set(RefreshStrategy.headerKey, 'invalid.token.value');
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

  it('should return 401 if refresh token signature is tampered', async () => {
    const { tokens } = await createTestUserAndTokens(app);
    const tamperedToken = tokens.refreshToken + 'tampered';

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set(RefreshStrategy.headerKey, tamperedToken);
    expect(res.status).toBe(401);
  });
});

describe('Mixed calls aka Login , Logout etc.. with /auth/refresh', () => {
  it('should return 401 if refresh token has been revoked', async () => {
    const { tokens } = await createTestUserAndTokens(app);
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set(RefreshStrategy.headerKey, tokens.refreshToken)
      .expect(204);

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set(RefreshStrategy.headerKey, tokens.refreshToken);

    expect(res.status).toBe(401);
  });

  it('should allow refresh token issued via login endpoint', async () => {
    const user = UserFactory.wajdi();
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(201);

    const refreshToken = loginResponse.body.refreshToken;
    expect(refreshToken).toBeDefined();

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set(RefreshStrategy.headerKey, refreshToken)
      .expect(201);

    expect(refreshResponse.body).toHaveProperty('accessToken');
    expect(refreshResponse.body.accessToken).not.toBe(loginResponse.body.accessToken);
  });
});