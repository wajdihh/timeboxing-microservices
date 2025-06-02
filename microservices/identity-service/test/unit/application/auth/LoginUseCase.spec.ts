import { LoginUseCase } from "@identity/application/auth/LoginUseCase";
import { PasswordHasherPort } from "@identity/application/auth/utils/PasswordHasherPort";
import { UserEntity } from "@identity/domain/user/UserEntity";
import { UserRepository } from "@identity/domain/user/UserRepository";
import { InvalidEmailError } from "@identity/domain/user/errors/InvalidEmailError";
import { InvalidCredentialsError } from "@identity/domain/auth/erros/InvalidCredentialsError";
import { ResultValue } from "@timeboxing/shared";

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockPasswordHasher: jest.Mocked<PasswordHasherPort>;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn().mockImplementation(() => ResultValue.ok(null)),
      findByID: jest.fn().mockImplementation(() => ResultValue.ok(null)),
      save: jest.fn().mockImplementation(() => ResultValue.ok(null)),
    } as unknown as jest.Mocked<UserRepository>;

    mockPasswordHasher = {
      compare: jest.fn().mockResolvedValue(true),
      hash: jest.fn().mockResolvedValue('hashedPassword'),
    } as unknown as jest.Mocked<PasswordHasherPort>;

    useCase = new LoginUseCase(mockUserRepo, mockPasswordHasher);
  });

  it('should return tokens for valid credentials', async () => {
    //Given
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = 'hashedPassword';
    const user = UserEntity.create('Test User', email, hashedPassword).unwrap();

    mockUserRepo.findByEmail.mockResolvedValue(ResultValue.ok(user));
    mockPasswordHasher.compare.mockResolvedValue(true);

    // when
    const result = await useCase.execute({ email, password });

    // then
    expect(result.isOk).toBe(true);
    expect(result.unwrap()).toBeInstanceOf(UserEntity);
  });

  it('should return InvalidCredentialsError if user does not exist', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(ResultValue.ok(null));

    const result = await useCase.execute({ email: 'unknown@example.com', password: 'password123' });

    expect(result.isOk).toBe(false);
    expect(result.error).toBeInstanceOf(InvalidCredentialsError);
  });

  it('should return InvalidCredentialsError if password is invalid', async () => {
    const email = 'test@example.com';
    const password = 'wrongPassword';
    const hashedPassword = 'hashedPassword';
    const user = UserEntity.create('Test User', email, hashedPassword).unwrap();

    mockUserRepo.findByEmail.mockResolvedValue(ResultValue.ok(user));
    mockPasswordHasher.compare.mockResolvedValue(false);

    const result = await useCase.execute({ email, password });

    expect(result.isOk).toBe(false);
    expect(result.error).toBeInstanceOf(InvalidCredentialsError);
  });

  it('should return InvalidEmailError for invalid email format', async () => {
    const result = await useCase.execute({ email: 'invalid-email', password: 'password123' });

    expect(result.isOk).toBe(false);
    expect(result.error).toBeInstanceOf(InvalidEmailError);
  });

  it('should return InvalidEmailError for empty email', async () => {
    const result = await useCase.execute({ email: '', password: 'password123' });

    expect(result.isOk).toBe(false);
    expect(result.error).toBeInstanceOf(InvalidEmailError);
  });

  it('should return InvalidCredentialsError for empty password', async () => {
    const email = 'test@example.com';
    const user = UserEntity.create('Test User', email, 'hashedPassword').unwrap();
    mockUserRepo.findByEmail.mockResolvedValue(ResultValue.ok(user));

    const result = await useCase.execute({ email, password: '' });

    expect(result.isOk).toBe(false);
    expect(result.error).toBeInstanceOf(InvalidCredentialsError);
  });
});
