import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/AppModule';
import { GlobalExceptionFilter, UserFactory } from '@timeboxing/shared';
import { RegisterUserRequestDto } from '../../../src/application/user/dto/RegisterUserRequestDto';
import { LoginRequestDto } from '../../../src/application/auth/dto/LoginRequestDto';
import { InvalidCredentialsError } from '@identity/domain/auth/errors/InvalidCredentialsError';
import { InvalidAccessTokenError } from '@identity/domain/auth/errors/InvalidAccessTokenError';

describe('UserController (e2e) - DELETE /user/me', () => {
    let app: INestApplication;
    let accessToken: string;
    let userToRegister: RegisterUserRequestDto;

    beforeEach(async () => {
        // Setup a new app instance and a new user for each test to ensure isolation
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalFilters(new GlobalExceptionFilter());
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
        await app.init();

        // Register a user
        const newUser = UserFactory.withAllFields();
        userToRegister = {
            email: newUser.email,
            password: newUser.password,
            name: newUser.name,
        };

        await request(app.getHttpServer())
            .post('/user')
            .send(userToRegister)
            .expect(201);

        // Login to get access token
        const loginDto: LoginRequestDto = {
            email: userToRegister.email,
            password: userToRegister.password,
        };
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send(loginDto)
            .expect(201);
        accessToken = loginResponse.body.accessToken;
    });

    afterEach(async () => {
        await app.close();
    });

    it('should delete the current authenticated user and prevent further login', async () => {
        // Act: Delete the user
        const deleteResponse = await request(app.getHttpServer())
            .delete('/user/me')
            .set('Authorization', `Bearer ${accessToken}`);

        // Assert: Deletion was successful
        expect(deleteResponse.status).toBe(200); // Or 204 if no content is returned

        // Act: Attempt to login with the deleted user's credentials
        const loginDto: LoginRequestDto = {
            email: userToRegister.email,
            password: userToRegister.password,
        };
        const loginResponseAfterDelete = await request(app.getHttpServer())
            .post('/auth/login')
            .send(loginDto);

        // Assert: Login fails
        expect(loginResponseAfterDelete.status).toBe(401); // Unauthorized
        expect(loginResponseAfterDelete.body.error).toBe(InvalidCredentialsError.name);

    });

    it('should return 401 Unauthorized if no token is provided for delete', async () => {
        // Act
        const response = await request(app.getHttpServer())
            .delete('/user/me');

        // Assert
        expect(response.status).toBe(401);
        expect(response.body.error).toBe(InvalidAccessTokenError.name);
    });

    it('should return 401 Unauthorized if an invalid token is provided for delete', async () => {
        // Act
        const response = await request(app.getHttpServer())
            .delete('/user/me')
            .set('Authorization', `Bearer invalid-token`);

        // Assert
        expect(response.status).toBe(401);
        expect(response.body.error).toBe(InvalidAccessTokenError.name);
    });
});
