import { RegisterUserUseCase } from '@identity/application/user/RegisterUserUseCase';
import { UserRepository } from '@identity/domain/user/UserRepository';
import { PasswordHasherPort } from '@identity/application/auth/utils/PasswordHasherPort';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { UserMapper } from '@identity/application/user/dto/UserMapper';
import { MetricsPort } from '@identity/application/observability/MetricsPort';
import { RegisterUserRequestDto } from '@identity/application/user/dto/RegisterUserRequestDto';
import { UserAlreadyExistsError } from '@identity/domain/user/errors/UserAlreadyExistsError';
import { InvalidEmailError } from '@identity/domain/user/errors/InvalidEmailError';
import { EmailValue } from '@identity/domain/user/value-objects/EmailValue';
import { BaseDomainError, BaseInfraError, ID, ResultValue } from '@timeboxing/shared';

// Mock UserMapper and EmailValue
jest.mock('@identity/application/user/dto/UserMapper');
jest.mock('@identity/domain/user/value-objects/EmailValue');

// Mock ID.generate() for UserEntity creation if UserMapper.toDomain relies on it
const mockGeneratedUserId = ID.fake();
jest.mock('@timeboxing/shared', () => {
    const originalModule = jest.requireActual('@timeboxing/shared');
    return {
        ...originalModule,
        ID: {
            ...originalModule.ID,
            generate: jest.fn(() => mockGeneratedUserId),
            fake: originalModule.ID.fake,
            from: originalModule.ID.from,
        },
    };
});


describe('RegisterUserUseCase', () => {
    let useCase: RegisterUserUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockPasswordHasherPort: jest.Mocked<PasswordHasherPort>;
    let mockMetricsPort: jest.Mocked<MetricsPort>;
    let mockUserEntity: UserEntity;

    const requestDto: RegisterUserRequestDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    };
    const hashedPassword = 'hashedPassword123';

    beforeEach(() => {
        mockUserRepository = {
            findByEmail: jest.fn(),
            save: jest.fn(),
            findByID: jest.fn(), // Added to satisfy UserRepository interface
        } as unknown as jest.Mocked<UserRepository>;

        mockPasswordHasherPort = {
            hash: jest.fn().mockResolvedValue(hashedPassword),
            compare: jest.fn(), // Added to satisfy PasswordHasherPort interface
        } as jest.Mocked<PasswordHasherPort>;

        mockMetricsPort = {
            incrementRegistration: jest.fn(),
            incrementLogin: jest.fn(),
            incrementLogout: jest.fn(),
            incrementRefreshToken: jest.fn(),
            getMetrics: jest.fn(),
            startRequestTimer: jest.fn().mockReturnValue(jest.fn()),
            incrementRequestCounter: jest.fn(),
            incrementErrorCounter: jest.fn(),
        } as jest.Mocked<MetricsPort>;
        
        const mockEmailValue = { value: requestDto.email } as EmailValue; // Consistent mock EmailValue
        mockUserEntity = {
            id: mockGeneratedUserId,
            name: requestDto.name,
            email: mockEmailValue,
            passwordHash: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
            // Add any methods if they are called on the entity instance, e.g., equals: jest.fn()
        } as UserEntity;

        (EmailValue.create as jest.Mock).mockReturnValue(ResultValue.ok(mockEmailValue));
        (UserMapper.toDomain as jest.Mock).mockReturnValue(ResultValue.ok(mockUserEntity));

        useCase = new RegisterUserUseCase(mockUserRepository, mockPasswordHasherPort, mockMetricsPort);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should successfully register a new user', async () => {
            // Given
            mockUserRepository.findByEmail.mockResolvedValue(ResultValue.ok(null)); // No existing user
            mockUserRepository.save.mockResolvedValue(undefined); // Corrected: save returns Promise<void>

            // When
            const result = await useCase.execute(requestDto);

            // Then
            expect(result.isOk).toBe(true);
            expect(result.unwrap()).toBe(mockUserEntity);
            expect(EmailValue.create).toHaveBeenCalledWith(requestDto.email);
            expect(mockPasswordHasherPort.hash).toHaveBeenCalledWith(requestDto.password);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith({ value: requestDto.email });
            expect(UserMapper.toDomain).toHaveBeenCalledWith(requestDto, hashedPassword);
            expect(mockUserRepository.save).toHaveBeenCalledWith(mockUserEntity);
            expect(mockMetricsPort.incrementRegistration).toHaveBeenCalled();
        });

        it('should return InvalidEmailError if email is invalid', async () => {
            // Given
            const invalidEmail = 'invalid-email';
            const error = new InvalidEmailError(invalidEmail);
            (EmailValue.create as jest.Mock).mockReturnValue(ResultValue.error(error));
            const dtoWithInvalidEmail = { ...requestDto, email: invalidEmail };

            // When
            const result = await useCase.execute(dtoWithInvalidEmail);

            // Then
            expect(result.isOk).toBe(false);
            expect(result.error).toBeInstanceOf(InvalidEmailError);
            expect(result.error).toEqual(error);
            expect(mockPasswordHasherPort.hash).not.toHaveBeenCalled();
        });

        it('should return UserAlreadyExistsError if user already exists', async () => {
            // Given
            mockUserRepository.findByEmail.mockResolvedValue(ResultValue.ok(mockUserEntity));

            // When
            const result = await useCase.execute(requestDto);

            // Then
            expect(result.isOk).toBe(false);
            expect(result.error).toBeInstanceOf(UserAlreadyExistsError);
            expect(result.error?.message).toContain(requestDto.email);
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });

        it('should return error from findByEmail if it fails', async () => {
            // Given
            const repoError = new BaseInfraError('Database error during findByEmail');
            mockUserRepository.findByEmail.mockResolvedValue(ResultValue.error(repoError));

            // When
            const result = await useCase.execute(requestDto);

            // Then
            expect(result.isOk).toBe(false);
            expect(result.error).toBe(repoError);
        });
        
        it('should return error if UserMapper.toDomain fails', async () => {
            // Given
            mockUserRepository.findByEmail.mockResolvedValue(ResultValue.ok(null)); // No existing user
            const mappingError = new BaseDomainError('Mapping to domain failed');
            (UserMapper.toDomain as jest.Mock).mockReturnValue(ResultValue.error(mappingError));
            await expect(useCase.execute(requestDto)).rejects.toThrow(mappingError.message);
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });

        it('should throw error if userRepository.save fails', async () => {
            // Given
            mockUserRepository.findByEmail.mockResolvedValue(ResultValue.ok(null)); // No existing user
            const saveError = new BaseDomainError('Database error during save');
            mockUserRepository.save.mockRejectedValue(saveError); // save returns Promise<void>

            // When / Then
            await expect(useCase.execute(requestDto)).rejects.toThrow(saveError);
            expect(mockUserRepository.save).toHaveBeenCalledWith(mockUserEntity);
        });
    });
});
