import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/AppModule';
import { GlobalExceptionFilter, UserFactory } from '@timeboxing/shared';
import { RegisterUserRequestDto } from '../../../src/application/user/dto/RegisterUserRequestDto';
import { LoginRequestDto } from '../../../src/application/auth/dto/LoginRequestDto';
import { UserResponseDto } from '../../../src/application/user/dto/UserResponseDto';
import { InvalidAccessTokenError } from '@identity/domain/auth/errors/InvalidAccessTokenError';

describe('UserController (e2e) - GET /user/me', () => {
  let app: INestApplication;
  let accessToken: string;
  let registeredUser: RegisterUserRequestDto;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    // Register a user
    const newUser = UserFactory.withAllFields();
    registeredUser = {
      email: newUser.email,
      password: newUser.password,
      name: newUser.name,
    };

    await request(app.getHttpServer())
      .post('/user')
      .send(registeredUser)
      .expect(201);

    // Login to get access token
    const loginDto: LoginRequestDto = {
      email: registeredUser.email,
      password: registeredUser.password,
    };
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(201); // Passport Return 201 for successful login
    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return the current authenticated user details', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer ${accessToken}`);

    // Assert
    expect(response.status).toBe(200); // GET /user/me should return 200 OK
    const userResponse = response.body as UserResponseDto;
    expect(userResponse).toBeDefined();
    expect(userResponse.email.toLowerCase()).toBe(registeredUser.email.toLowerCase());
    expect(userResponse.name).toBe(registeredUser.name);
    expect(userResponse).toHaveProperty('id');
  });

  it('should return 401 Unauthorized if no token is provided', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get('/user/me');

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.error).toBe(InvalidAccessTokenError.name);
  });

  it('should return 401 Unauthorized if an invalid token is provided', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', `Bearer invalid-token`);

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.error).toBe(InvalidAccessTokenError.name);
  });
});
