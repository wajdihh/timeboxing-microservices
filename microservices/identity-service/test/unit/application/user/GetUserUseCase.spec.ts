import { GetUserUseCase } from '@identity/application/user/GetUserUseCase';
import { UserRepository } from '@identity/domain/user/UserRepository';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { UserMapper } from '@identity/application/user/dto/UserMapper';
import { UserResponseDto } from '@identity/application/user/dto/UserResponseDto';
import { UserNotFoundError } from '@identity/domain/user/errors/UserNotFoundError';
import { InvalidIDError, ID, ResultValue, BaseInfraError } from '@timeboxing/shared'; // Assuming this path is okay

// Mock UserMapper
jest.mock('@identity/application/user/dto/UserMapper');

// Mock ID.from and ID.generate (if UserEntity.create uses it)
const mockValidIdValue = ID.fake();
const mockIdString = mockValidIdValue.value;

jest.mock('@timeboxing/shared', () => {
  const originalModule = jest.requireActual('@timeboxing/shared');
  return {
    ...originalModule,
    ID: {
      ...originalModule.ID,
      from: jest.fn((idString: string) => {
        if (idString === 'invalid-id-format') {
          return ResultValue.error(new InvalidIDError(idString));
        }
        // For any other string, assume it's valid and return a mocked ID value
        // This specific mock for 'from' might need adjustment based on how ID.fake() or ID.generate() is used
        // For now, let's ensure it returns a specific valid ID for the happy path.
        return ResultValue.ok({ value: idString, equals: (other?: ID | undefined) => other?.value === idString } as ID);
      }),
      generate: jest.fn(() => originalModule.ID.fake()), // Keep generate working if needed
      fake: originalModule.ID.fake, // Keep fake working
    },
  };
});


describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Reset mocks for ID.from before each test if different behaviors are needed
    (ID.from as jest.Mock).mockImplementation((idString: string) => {
      if (idString === 'invalid-id-format') {
        return ResultValue.error(new InvalidIDError(idString));
      }
      // Return a consistent valid ID object for valid strings
      return ResultValue.ok({ value: idString, equals: (other?: ID | undefined) => other?.value === idString } as ID);
    });


    mockUserRepository = {
      findByID: jest.fn(),
      findByEmail: jest.fn(), // Add other methods if UserRepository interface requires them
      save: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    useCase = new GetUserUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return UserResponseDto if user is found', async () => {
      // Given
      const userEntity = UserEntity.create('Test User', 'test@example.com', 'hashedPassword').unwrap();
      const idValueForRepo = { value: mockIdString, equals: (other?: ID | undefined) => other?.value === mockIdString } as ID;
      
      mockUserRepository.findByID.mockResolvedValue(ResultValue.ok(userEntity));
      
      const expectedDtoDate = new Date();
      const expectedDto: UserResponseDto = { 
        id: mockIdString, 
        name: 'Test User', 
        email: 'test@example.com', 
        createdAt: expectedDtoDate.toISOString() 
      };
      (UserMapper.toResponse as jest.Mock).mockReturnValue({ ...expectedDto }); // Ensure UserMapper returns all fields
      (ID.from as jest.Mock).mockReturnValue(ResultValue.ok(idValueForRepo));

      // When
      const result = await useCase.execute(mockIdString);

      // Then
      expect(result.isOk).toBe(true);
      expect(result.unwrap()).toEqual(expectedDto);
      expect(ID.from).toHaveBeenCalledWith(mockIdString);
      expect(mockUserRepository.findByID).toHaveBeenCalledWith(idValueForRepo);
      expect(UserMapper.toResponse).toHaveBeenCalledWith(userEntity);
    });

    it('should return InvalidIDError if ID.from fails', async () => {
      // Given
      const invalidIdString = 'invalid-id-format';
      const expectedError = new InvalidIDError(invalidIdString);
      (ID.from as jest.Mock).mockReturnValue(ResultValue.error(expectedError));

      // When
      const result = await useCase.execute(invalidIdString);

      // Then
      expect(result.isOk).toBe(false);
      expect(result.error).toBe(expectedError);
      expect(mockUserRepository.findByID).not.toHaveBeenCalled();
    });

    it('should return UserNotFoundError if user is not found', async () => {
      // Given
      const idValueForRepo = { value: mockIdString, equals: (other?: ID | undefined) => other?.value === mockIdString } as ID;
      (ID.from as jest.Mock).mockReturnValue(ResultValue.ok(idValueForRepo));
      mockUserRepository.findByID.mockResolvedValue(ResultValue.ok(null)); // User not found

      // When
      const result = await useCase.execute(mockIdString);

      // Then
      expect(result.isOk).toBe(false);
      expect(result.error).toBeInstanceOf(UserNotFoundError);
      expect(result.error?.message).toContain(mockIdString); // Check if UserNotFoundError includes the ID
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
    });

    it('should return error from repository if findByID fails', async () => {
      // Given
      const idValueForRepo = { value: mockIdString, equals: (other?: ID | undefined) => other?.value === mockIdString } as ID;
      (ID.from as jest.Mock).mockReturnValue(ResultValue.ok(idValueForRepo));
      const repositoryError = new BaseInfraError('Database connection error');
      mockUserRepository.findByID.mockResolvedValue(ResultValue.error(repositoryError));

      // When
      await expect(useCase.execute(mockIdString)).rejects.toThrow(repositoryError.message);
      // Then
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
    });
  });
});
