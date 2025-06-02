import { RegisterUserRequestDto } from '@identity/application/user/dto/RegisterUserRequestDto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('RegisterUserRequestDto', () => {
  describe('sample', () => {
    it('should return a sample RegisterUserRequestDto object with correct properties', () => {
      // When
      const sampleDto = RegisterUserRequestDto.sample();

      // Then
      expect(sampleDto).toBeDefined();
      expect(typeof sampleDto.name).toBe('string');
      expect(typeof sampleDto.email).toBe('string');
      expect(typeof sampleDto.password).toBe('string');
    });
  });

  describe('validation and transformation', () => {
    it('should validate a correct DTO', async () => {
      const dto = plainToInstance(RegisterUserRequestDto, {
        name: 'Test User',
        email: ' test@example.com ', 
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.email).toBe('test@example.com'); 
    });

    it('should fail validation if name is missing', async () => {
        const dto = plainToInstance(RegisterUserRequestDto, {
            // name is missing
            email: 'test@example.com',
            password: 'password123',
          });
          const errors = await validate(dto);
          expect(errors.length).toBeGreaterThan(0);
          expect(errors[0]?.property).toBe('name');
    });

    it('should fail validation for invalid email', async () => {
      const dto = plainToInstance(RegisterUserRequestDto, {
        name: 'Test User',
        email: 'not-an-email',
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('email');
      expect(errors[0]?.constraints?.isEmail).toBeDefined();
    });

    it('should fail validation for password too short', async () => {
      const dto = plainToInstance(RegisterUserRequestDto, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'short', 
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('password');
      expect(errors[0]?.constraints?.isLength).toBeDefined();
    });

    it('should fail validation for password too long', async () => {
      const dto = plainToInstance(RegisterUserRequestDto, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'a'.repeat(33), 
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('password');
      expect(errors[0]?.constraints?.isLength).toBeDefined();
    });

    it('should transform email to lowercase and trim whitespace', () => {
        const dto = plainToInstance(RegisterUserRequestDto, {
            name: 'Test User',
            email: '  TestEmail@Example.COM  ',
            password: 'validPassword123'
        });
        expect(dto.email).toBe('testemail@example.com');
    });
  });
});
