import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { AppModule } from '../../../src/AppModule';
import { UserFactory } from '@timeboxing/shared';
import { RegisterUserRequestDto } from '@identity/application/user/dto/RegisterUserRequestDto';

describe('AuthController (e2e) - /auth/register', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/register - should register a new user successfully and test increment metrics', async () => {
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

     // Act - fetch /metrics
    const metricsRes = await request(app.getHttpServer())
      .get('/metrics');

    // Assert - metric incremented
    expect(metricsRes.status).toBe(200);
    expect(metricsRes.text).toContain('identity_registrations_total{method="POST"}');
  });

  it('POST /auth/register - should throttle requests after exceeding the limit', async () => {
    const newUser = UserFactory.withAllFields();
    const registerDto: RegisterUserRequestDto = {
      name: newUser.name,
      email: `throttle-test-${Date.now()}@example.com`, 
      password: newUser.password,
    };
    
    const configuredLimit = 3; // As configured in AuthController for /auth/register

    // Make 'configuredLimit' successful requests
    for (let i = 0; i < configuredLimit; i++) {
      const uniqueEmailDto = { ...registerDto, email: `throttle-loop-${i}-${Date.now()}@example.com` };
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(uniqueEmailDto);
      expect(response.status).not.toBe(HttpStatus.TOO_MANY_REQUESTS); 
    }

    // Make one more request - this one (limit + 1) should be throttled.
    const throttledResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...registerDto, email: `throttle-final-${Date.now()}@example.com` });

    expect(throttledResponse.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(throttledResponse.body.message).toContain('ThrottlerException: Too Many Requests');
  });

  it('POST /auth/register - should return 400 if email already exists', async () => {
    // Arrange: First, register a user
    const existingUser = UserFactory.withAllFields();
    const registerDto: RegisterUserRequestDto = {
      email: `existing-${Date.now()}@example.com`, // Unique email for first registration
      password: existingUser.password,
      name: existingUser.name,
    };
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(HttpStatus.CREATED);

    // Act: Attempt to register the same user again
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    // Assert
    // Based on AuthController logic, UserAlreadyExistsError from use case results in 400
    expect(response.status).toBe(HttpStatus.BAD_REQUEST); 
    expect(response.body.message).toContain('User with email'); // Or specific error message from UserAlreadyExistsError
    expect(response.body.message).toContain('already exists');
  });

  it('POST /auth/register - should return 400 Bad Request for missing email', async () => {
    const newUser = UserFactory.withAllFields();
    const registerDto = {
      name: newUser.name,
      // email is missing
      password: newUser.password,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(expect.arrayContaining(['email must be an email']));
  });

  it('POST /auth/register - should return 400 Bad Request for invalid email format', async () => {
    const newUser = UserFactory.withAllFields();
    const registerDto: RegisterUserRequestDto = {
      name: newUser.name,
      email: 'invalid-email-format',
      password: newUser.password,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(expect.arrayContaining(['email must be an email']));
  });

  it('POST /auth/register - should return 400 Bad Request for missing password', async () => {
    const newUser = UserFactory.withAllFields();
    const registerDto = {
      name: newUser.name,
      email: `missing-pass-${Date.now()}@example.com`,
      // password is missing
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toEqual(expect.arrayContaining([
      'password must be a string',
      'password must be longer than or equal to 8 characters'
    ]));
  });
});
