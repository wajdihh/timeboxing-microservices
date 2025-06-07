import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/AppModule'; 
import { UserFactory } from '@timeboxing/shared';

describe('AuthController (e2e) - /auth/login', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login - should log in a registered user with valid credentials and return tokens', async () => {
    
    const wajdi = UserFactory.wajdi();
    const loginDto = { email: wajdi.email, password: wajdi.password }; 

    // Act
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);

    // Assert
    expect(response.status).toBe(201); // Or 200 depending on your design
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });
  
    it('POST /auth/login - should return 401 if credentials are invalid', async () => {
    
    const wajdi = UserFactory.wajdi();
    const loginDto = { email: wajdi.email, password: 'blabla' }; 

    // Act
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);

    // Assert
    expect(response.status).toBe(401); 
    expect(response.body.error).toBe('InvalidCredentialsError');
    expect(response.body).not.toHaveProperty('accessToken');
    expect(response.body).not.toHaveProperty('refreshToken');
  });

    it('POST /auth/login - should return 401 if email not found', async () => {
    
    const wajdi = UserFactory.wajdi();
    const loginDto = { email: wajdi.email+ 'blabla', password: wajdi.password }; 

    // Act
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);

    // Assert
    expect(response.status).toBe(401); 
    expect(response.body.error).toBe('InvalidCredentialsError');
    expect(response.body).not.toHaveProperty('accessToken');
    expect(response.body).not.toHaveProperty('refreshToken');
  });

  it('POST /auth/login - should throttle requests after exceeding the limit', async () => {
    const wajdi = UserFactory.wajdi();
    const loginDto = { email: wajdi.email, password: wajdi.password };
    const limit = 10; // As configured in AppModule. 10 requests allowed, 11th is throttled.
    const priorRequestsCount = 3; // Requests from previous tests in this file.
    // Number of requests to make in the loop to reach the limit of 10 successful requests.
    const remainingAllowance = limit - priorRequestsCount; // Should be 10 - 3 = 7

    // Make 'remainingAllowance' number of requests.
    // These account for requests #4 through #10 for this IP address. All should pass.
    for (let i = 0; i < remainingAllowance; i++) { // Loop 7 times
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);
      // Expect a successful login or an auth error, but not 429
      expect(response.status).not.toBe(429); // Requests #4 through #10
    }

    // Make one more request - this one (11th overall for this IP) should be throttled.
    const throttledResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);

    expect(throttledResponse.status).toBe(429); // Too Many Requests
    expect(throttledResponse.body.message).toContain('ThrottlerException: Too Many Requests'); // Or similar default message
  });
});
