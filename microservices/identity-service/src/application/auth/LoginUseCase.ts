import { InvalidCredentialsError } from "@identity/domain/auth/erros/InvalidCredentialsError";
import { InvalidEmailError } from "@identity/domain/user/errors/InvalidEmailError";
import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { DomainHttpCode, ResultValue, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { EmailValue } from "@identity/domain/user/value-objects/EmailValue";
import { PasswordHasherPort } from "./utils/PasswordHasherPort";
import { LoginRequestDto } from "./dto/LoginRequestDto";
import { LoginResponseDto } from "./dto/LoginResponseDto";
import { LoginMapper } from "./dto/LoginMapper";
import { AuthRepository } from "@identity/domain/auth/AuthRepository";

@SwaggerUseCaseMetadata({
    errors: [InvalidEmailError, InvalidCredentialsError],
    request: LoginRequestDto,
    response: LoginResponseDto,
    successStatus: DomainHttpCode.CREATED,
})

@Injectable()
export class LoginUseCase {
    constructor(private readonly userRepository: UserRepository,
        private readonly authRepository: AuthRepository,
        private readonly passwordHashPort: PasswordHasherPort) { }

    async execute(dto: LoginRequestDto): Promise<ResultValue<LoginResponseDto, InvalidCredentialsError | InvalidEmailError>> {

        const email = dto.email;
        const password = dto.password;

        const emailResult = EmailValue.create(email);
        if (emailResult.isFail) return ResultValue.error(new InvalidEmailError(email));

        const emailValue = emailResult.unwrap();
        const userResult = await this.userRepository.findByEmail(emailValue);
        const userValue = userResult.unwrap();

        const passwordResult = await this.passwordHashPort.compare(password, userValue?.passwordHash || '');
        if (!userValue || !passwordResult) return ResultValue.error(new InvalidCredentialsError());

        const [accessTokenResult, refreshTokenResult] = await Promise.all([
            this.authRepository.generateAccessToken(userValue),
            this.authRepository.generateRefreshToken(userValue)
        ]);

        if (accessTokenResult.isFail) return ResultValue.error(accessTokenResult.error);
        if (refreshTokenResult.isFail) return ResultValue.error(refreshTokenResult.error);

        const accessTokenValue = accessTokenResult.unwrap();
        const refreshTokenValue = refreshTokenResult.unwrap();
        const response = LoginMapper.toResponse(accessTokenValue, refreshTokenValue);

        return ResultValue.ok(response);
    }
}