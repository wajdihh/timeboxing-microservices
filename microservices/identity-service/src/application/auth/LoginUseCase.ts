import { InvalidEmailError } from "@identity/domain/user/errors/InvalidEmailError";
import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { ResultValue, SuccessStatus, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { EmailValue } from "@identity/domain/user/value-objects/EmailValue";
import { PasswordHasherPort } from "./utils/PasswordHasherPort";
import { LoginRequestDto } from "./dto/LoginRequestDto";
import { AuthResponseDto } from "./dto/AuthResponseDto";
import { UserEntity } from "@identity/domain/user/UserEntity";
import { InvalidCredentialsError } from "@identity/domain/auth/errors/InvalidCredentialsError";
import { MetricsPort } from "../observability/MetricsPort";

@SwaggerUseCaseMetadata({
    errors: [InvalidEmailError, InvalidCredentialsError],
    request: LoginRequestDto,
    response: AuthResponseDto,
    successStatus: SuccessStatus.CREATED,
})


@Injectable()
export class LoginUseCase {
    constructor(private readonly userRepository: UserRepository,
        private readonly passwordHashPort: PasswordHasherPort,
        private readonly metricsPort: MetricsPort) { }

    async execute(dto: LoginRequestDto): Promise<ResultValue<UserEntity, InvalidCredentialsError | InvalidEmailError>> {
        const email = dto.email;
        const password = dto.password;

        if (!password) {
            return ResultValue.error(new InvalidCredentialsError());
        }

        const emailResult = EmailValue.create(email);
        if (emailResult.isFail) return ResultValue.error(new InvalidEmailError(email));

        const emailValue = emailResult.unwrap();
        const userResult = await this.userRepository.findByEmail(emailValue);
        if (userResult.isFail) return ResultValue.error(new InvalidCredentialsError());
        const userValue = userResult.unwrap();

        const isPasswordValid = await this.passwordHashPort.compare(password, userValue?.passwordHash || '');
        if (!userValue || !isPasswordValid) return ResultValue.error(new InvalidCredentialsError());

        this.metricsPort.incrementLogin('POST');
    
        return ResultValue.ok(userValue);
    }
}
