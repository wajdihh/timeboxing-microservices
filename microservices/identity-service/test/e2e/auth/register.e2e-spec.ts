import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { AppModule } from '../../../src/AppModule';
import { UserFactory } from '@timeboxing/shared';
import { RegisterUserRequestDto } from '@identity/application/user/dto/RegisterUserRequestDto';

describe('AuthController (e2e) - /auth/register', () => {
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

  it('POST /auth/register - should register a new user successfully', async () => {
    const newUser = UserFactory.withAllFields();
    const registerDto: RegisterUserRequestDto = {
      name: newUser.name,
      email: `test-${Date.now()}@example.com`, // Ensure unique email for each test run
      password: newUser.password, // Use the plain password from factory
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(registerDto.email);
    expect(response.body.name).toBe(registerDto.name);
    // Check for x-correlation-id header
    expect(response.headers['x-correlation-id']).toBeDefined();
    expect(typeof response.headers['x-correlation-id']).toBe('string');
  });

  it('POST /auth/register - should throttle requests after exceeding the limit', async () => {
    const newUser = UserFactory.withAllFields();
    const registerDto: RegisterUserRequestDto = {
      name: newUser.name,
      // Unique email for each request in the loop to avoid "UserAlreadyExistsError"
      // but the throttling is IP-based, so this won't affect the throttle count itself.
      email: `throttle-test-${Date.now()}@example.com`, 
      password: newUser.password, // Use the plain password from factory
    };
    
    const configuredLimit = 3; // As configured in AuthController for register route
    const priorRequestsInThisFile = 1; // From the "should register a new user successfully" test
    const remainingAllowance = configuredLimit - priorRequestsInThisFile; // Should be 3 - 1 = 2

    // Make 'remainingAllowance' number of requests - these should pass
    // These account for requests #2 and #3 for this IP to /auth/register.
    for (let i = 0; i < remainingAllowance; i++) {
      const uniqueEmailDto = { ...registerDto, email: `throttle-loop-${i}-${Date.now()}@example.com` };
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(uniqueEmailDto);
      expect(response.status).not.toBe(HttpStatus.TOO_MANY_REQUESTS); // Requests #2, #3
    }

    // Make one more request - this one (4th overall to /auth/register for this IP) should be throttled.
    const throttledResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...registerDto, email: `throttle-final-${Date.now()}@example.com` });

    expect(throttledResponse.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(throttledResponse.body.message).toContain('ThrottlerException: Too Many Requests');
  });
});
