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
});