import { UserMapper } from '@identity/application/user/dto/UserMapper';
import { RegisterUserRequestDto } from '@identity/application/user/dto/RegisterUserRequestDto';
import { UserResponseDto } from '@identity/application/user/dto/UserResponseDto';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { EmailValue } from '@identity/domain/user/value-objects/EmailValue';
import { InvalidEmailError } from '@identity/domain/user/errors/InvalidEmailError';
import { ID, ResultValue } from '@timeboxing/shared';

const mockUserId = ID.fake();
jest.mock('@identity/domain/user/UserEntity', () => {
  // Import original UserEntity to use its structure or other static methods if needed
  const originalUserEntity = jest.requireActual('@identity/domain/user/UserEntity');
  return {
    UserEntity: {
      ...originalUserEntity, 
      create: jest.fn((name: string, email: string, passwordHash: string) => {
        if (email === 'invalid-email@test.com') {
          return ResultValue.error(new InvalidEmailError(email));
        }
        const mockEmailValue = { value: email.toLowerCase() } as EmailValue;
        return ResultValue.ok({
          id: mockUserId, 
          name,
          email: mockEmailValue,
          passwordHash,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as UserEntity);
      }),
    },
  };
});


describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map RegisterUserRequestDto to UserEntity using UserEntity.create', () => {
      // Given
      const dto: RegisterUserRequestDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword';
      
      const expectedEmailValue = { value: dto.email.toLowerCase() } as EmailValue;
      const expectedUserEntity = {
        id: mockUserId,
        name: dto.name,
        email: expectedEmailValue,
        passwordHash: hashedPassword,
        createdAt: expect.any(Date), 
        updatedAt: expect.any(Date),
      } as UserEntity;

      // When
      const result = UserMapper.toDomain(dto, hashedPassword);

      // Then
      expect(UserEntity.create).toHaveBeenCalledWith(dto.name, dto.email, hashedPassword);
      expect(result.isOk).toBe(true);
      // Compare properties as the object might not be the exact same instance due to mocking details
      const actualUser = result.unwrap();
      expect(actualUser.id).toEqual(expectedUserEntity.id);
      expect(actualUser.name).toEqual(expectedUserEntity.name);
      expect(actualUser.email).toEqual(expectedUserEntity.email);
      expect(actualUser.passwordHash).toEqual(expectedUserEntity.passwordHash);
    });

    it('should return error from UserEntity.create if email is invalid', () => {
        // Given
        const dto: RegisterUserRequestDto = {
          name: 'Test User',
          email: 'invalid-email@test.com', 
          password: 'password123',
        };
        const hashedPassword = 'hashedPassword';
  
        // When
        const result = UserMapper.toDomain(dto, hashedPassword);
  
        // Then
        expect(UserEntity.create).toHaveBeenCalledWith(dto.name, dto.email, hashedPassword);
        expect(result.isOk).toBe(false);
        expect(result.error).toBeInstanceOf(InvalidEmailError);
      });
  });

  describe('toResponse', () => {
    it('should map UserEntity to UserResponseDto', () => {
      // Given
      const now = new Date();
      const mockEmail = { value: 'user@example.com' } as EmailValue;
      const userEntity: UserEntity = {
        id: ID.fake(),
        name: 'Domain User',
        email: mockEmail,
        passwordHash: 'domainHashedPassword',
        createdAt: now,
        updatedAt: now,
      } as UserEntity; 

      // When
      const result: UserResponseDto = UserMapper.toResponse(userEntity);

      // Then
      expect(result).toEqual({
        id: userEntity.id.value,
        name: userEntity.name,
        email: userEntity.email.value,
        createdAt: now.toISOString(),
      });
    });
  });
});
