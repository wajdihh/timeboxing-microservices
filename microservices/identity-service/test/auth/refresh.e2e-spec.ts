import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createTestUserAndTokens } from './helpers/TestAuthUtil';
import { AppModule } from '@identity/AppModule';

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

  it('should return 401 if no token is provided', async () => {
    const res = await request(app.getHttpServer()).post('/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('should return new access token for valid refresh token', async () => {
    const { tokens } = await createTestUserAndTokens(app);

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: tokens.refreshToken })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.accessToken).not.toBe(tokens.accessToken);
  });
});
