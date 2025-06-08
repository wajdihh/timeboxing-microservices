import { DeleteUserUseCase } from '@identity/application/user/DeleteUserUseCase';
import { UserRepository } from '@identity/domain/user/UserRepository';
import { TokenRepository } from '@identity/domain/auth/TokenRepository';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { UserNotFoundError } from '@identity/domain/user/errors/UserNotFoundError';
import { InvalidIDError, ID, ResultValue, BaseInfraError } from '@timeboxing/shared';

jest.mock('@timeboxing/shared', () => {
  const originalModule = jest.requireActual('@timeboxing/shared');
  return {
    ...originalModule,
    ID: {
      ...originalModule.ID,
      from: jest.fn((idString: string) => {
        if (idString === 'invalid-id') {
          return ResultValue.error(new InvalidIDError(idString));
        }
        return ResultValue.ok({ value: idString, equals: (other?: ID) => other?.value === idString } as ID);
      }),
      generate: jest.fn(() => originalModule.ID.fake()),
      fake: originalModule.ID.fake,
    },
  };
});

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockTokenRepository: jest.Mocked<TokenRepository>;
  const userEntity = UserEntity.create('John', 'john@example.com', 'hash').unwrap();

  beforeEach(() => {
    mockUserRepository = {
      findByID: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockTokenRepository = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllRefreshToken: jest.fn().mockResolvedValue(ResultValue.ok()),
    } as unknown as jest.Mocked<TokenRepository>;

    useCase = new DeleteUserUseCase(mockUserRepository, mockTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete user and revoke tokens', async () => {
    const id = '123';
    const idValue = { value: id, equals: (other?: ID) => other?.value === id } as ID;
    (ID.from as jest.Mock).mockReturnValueOnce(ResultValue.ok(idValue));
    mockUserRepository.findByID.mockResolvedValue(ResultValue.ok(userEntity));
    mockUserRepository.delete.mockResolvedValue();

    const result = await useCase.execute(id);

    expect(result.isOk).toBe(true);
    expect(mockUserRepository.findByID).toHaveBeenCalledWith(idValue);
    expect(mockUserRepository.delete).toHaveBeenCalledWith(idValue);
    expect(mockTokenRepository.revokeAllRefreshToken).toHaveBeenCalledWith(id);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const id = 'not-exist';
    const idValue = { value: id, equals: (other?: ID) => other?.value === id } as ID;
    (ID.from as jest.Mock).mockReturnValueOnce(ResultValue.ok(idValue));
    mockUserRepository.findByID.mockResolvedValue(ResultValue.ok(null));

    const result = await useCase.execute(id);

    expect(result.isOk).toBe(false);
    expect(result.error).toBeInstanceOf(UserNotFoundError);
  });

  it('should return InvalidIDError if id is invalid', async () => {
    const result = await useCase.execute('invalid-id');

    expect(result.isOk).toBe(false);
    expect(result.error).toBeInstanceOf(InvalidIDError);
    expect(mockUserRepository.findByID).not.toHaveBeenCalled();
  });

  it('should return repository error if findByID fails', async () => {
    const id = '123';
    const idValue = { value: id, equals: (other?: ID) => other?.value === id } as ID;
    (ID.from as jest.Mock).mockReturnValueOnce(ResultValue.ok(idValue));
    const repoError = new BaseInfraError('db');
    mockUserRepository.findByID.mockResolvedValue(ResultValue.error(repoError));

    const result = await useCase.execute(id);

    expect(result.isOk).toBe(false);
    expect(result.error).toBe(repoError);
  });

  it('should throw if delete fails', async () => {
    const id = '123';
    const idValue = { value: id, equals: (other?: ID) => other?.value === id } as ID;
    (ID.from as jest.Mock).mockReturnValueOnce(ResultValue.ok(idValue));
    mockUserRepository.findByID.mockResolvedValue(ResultValue.ok(userEntity));
    const repoError = new Error('db');
    mockUserRepository.delete.mockRejectedValue(repoError);

    await expect(useCase.execute(id)).rejects.toThrow(repoError);
  });
});
