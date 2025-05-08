import { InvalidCredentialsError } from "@identity/domain/auth/erros/InvalidCredentialsError";
import { InvalidEmailError } from "@identity/domain/user/errors/InvalidEmailError";
import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { ResultValue, SuccessStatus, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { EmailValue } from "@identity/domain/user/value-objects/EmailValue";
import { PasswordHasherPort } from "./utils/PasswordHasherPort";
import { LoginRequestDto } from "./dto/LoginRequestDto";
import { AuthResponseDto } from "./dto/AuthResponseDto";
import { UserEntity } from "@identity/domain/user/UserEntity";

@SwaggerUseCaseMetadata({
    errors: [InvalidEmailError, InvalidCredentialsError],
    request: LoginRequestDto,
    response: AuthResponseDto,
    successStatus: SuccessStatus.CREATED,
})

/**
 * We GOT AN EXCEPTION FOR OUR DDD here 
 * Passport uses Stratgy to call useCase , and useCase should return entity and not EntityResponseDTO 
 * Then this stratgy is used directly by controller 
 * SO ONLY FOR passport 
 * Controller -> Stratgy -> UseCase
 */

@Injectable()
export class LoginUseCase {
    constructor(private readonly userRepository: UserRepository,
        private readonly passwordHashPort: PasswordHasherPort) { }

    async execute(dto: LoginRequestDto): Promise<ResultValue<UserEntity, InvalidCredentialsError | InvalidEmailError>> {

        const email = dto.email;
        const password = dto.password;

        const emailResult = EmailValue.create(email);
        if (emailResult.isFail) return ResultValue.error(new InvalidEmailError(email));

        const emailValue = emailResult.unwrap();
        const userResult = await this.userRepository.findByEmail(emailValue);
        if (userResult.isFail) return ResultValue.error(new InvalidCredentialsError());
        const userValue = userResult.unwrap();

        const isPasswordValid = await this.passwordHashPort.compare(password, userValue?.passwordHash || '');
        if (!userValue || !isPasswordValid) return ResultValue.error(new InvalidCredentialsError());

        return ResultValue.ok(userValue);
    }
}