import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/AppModule';
import { GlobalExceptionFilter, UserFactory } from '@timeboxing/shared'; // Assuming UserFactory is in shared
import { RegisterUserRequestDto } from '../../../src/application/user/dto/RegisterUserRequestDto';

describe('UserController (e2e) - /user', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /user', () => {
    it('should register a new user with valid data and return success', async () => {
      const newUser = UserFactory.withAllFields(); // Using a generic create method
      const registerDto: RegisterUserRequestDto = {
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(registerDto);

      // Assert
      expect(response.status).toBe(201); // HTTP 201 Created
      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 409 Conflict if email already exists', async () => {
      // Arrange: First, register a user
      const existingUser = UserFactory.withAllFields();
      const registerDto: RegisterUserRequestDto = {
        email: existingUser.email,
        password: existingUser.password,
        name: existingUser.name,
      };
      await request(app.getHttpServer())
        .post('/user')
        .send(registerDto)
        .expect(201);

      // Act: Attempt to register the same user again
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(registerDto);

      // Assert
      expect(response.status).toBe(409); // HTTP 409 Conflict
      expect(response.body.error).toBe('UserAlreadyExistsError');
    });

    it('should return 400 Bad Request for missing email', async () => {
      const newUser = UserFactory.withAllFields();
      const registerDto = {
        name: newUser.name,
        // email: newUser.email, 
        password: newUser.password,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(registerDto);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(expect.arrayContaining(['email must be an email']));
    });

    it('should return 400 Bad Request for invalid email format', async () => {
      const newUser = UserFactory.withAllFields();
      const registerDto: RegisterUserRequestDto = {
        name: newUser.name,
        email: 'invalid-email',
        password: newUser.password,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(registerDto);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(expect.arrayContaining(['email must be an email']));
    });

    it('should return 400 Bad Request for missing password', async () => {
      const newUser = UserFactory.withAllFields();
      const registerDto = {
        name: newUser.name,
        email: newUser.email,
        // password: newUser.password, // Missing password
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(registerDto);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(expect.arrayContaining([
        'password must be a string',
        'password must be longer than or equal to 8 characters'
      ]));
    });

  });
});
