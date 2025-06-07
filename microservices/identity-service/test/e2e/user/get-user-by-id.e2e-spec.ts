import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/AppModule';
import { GlobalExceptionFilter, UserFactory, ID, InvalidIDError } from '@timeboxing/shared'; // Added ID import
import { RegisterUserRequestDto } from '../../../src/application/user/dto/RegisterUserRequestDto';
import { UserResponseDto } from '../../../src/application/user/dto/UserResponseDto';
import { LoginRequestDto } from '../../../src/application/auth/dto/LoginRequestDto'; // For getting user ID after registration
import { UserNotFoundError } from '@identity/domain/user/errors/UserNotFoundError';

describe('UserController (e2e) - GET /user?id=:id', () => {
  let app: INestApplication;
  let registeredUserId: string;
  let registeredUserEmail: string;
  let registeredUserName: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    // Register a user to get an ID
    const newUser = UserFactory.withAllFields();
    const registerDto: RegisterUserRequestDto = {
      email: newUser.email,
      password: newUser.password,
      name: newUser.name,
    };
    registeredUserEmail = newUser.email;
    registeredUserName = newUser.name;

    await request(app.getHttpServer())
      .post('/user')
      .send(registerDto)
      .expect(201);

    // To get the user ID, we can login and then fetch /user/me
    // This is a bit indirect but ensures we get the actual ID from the system
    const loginDto: LoginRequestDto = { email: newUser.email, password: newUser.password };
    const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);
    const accessToken = loginResponse.body.accessToken;

    const userMeResponse = await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    registeredUserId = userMeResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return user details for a valid and existing user ID', async () => {
    // Act
    const response = await request(app.getHttpServer())
      .get(`/user?id=${registeredUserId}`);

    // Assert
    expect(response.status).toBe(200);
    const userResponse = response.body as UserResponseDto;
    expect(userResponse).toBeDefined();
    expect(userResponse.id).toBe(registeredUserId);
    expect(userResponse.email.toLowerCase()).toBe(registeredUserEmail.toLowerCase());
    expect(userResponse.name).toBe(registeredUserName);
  });

  it('should return 404 Not Found if the user ID does not exist', async () => {
    const nonExistentId = ID.generate().value; // Use a valid, randomly generated UUID
    // Act
    const response = await request(app.getHttpServer())
      .get(`/user?id=${nonExistentId}`);

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.error).toBe(UserNotFoundError.name);
  });

  it('should return 400 Bad Request for an invalid user ID format', async () => {
    const invalidId = 'invalid-uuid-format';
    // Act
    const response = await request(app.getHttpServer())
      .get(`/user?id=${invalidId}`);

    // Assert
    expect(response.status).toBe(422); // InvalidIDError maps to 422
    expect(response.body.statusCode).toBe(422);
    expect(response.body.error).toBe(InvalidIDError.name);
    expect(response.body.message).toBe('The ID "Invalid UUID format: invalid-uuid-format" is invalid.');
  });
});
