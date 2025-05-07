import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { DomainHttpCode, ResultValue, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { LoginResponseDto } from "./dto/LoginResponseDto";
import { LoginMapper } from "./dto/LoginMapper";
import { AuthRepository } from "@identity/domain/auth/AuthRepository";
import { RefreshTokenRequestDto } from "./dto/RefreshTokenRequestDto";
import { UserNotFoundError } from "@identity/domain/user/errors/UserNotFoundError";
import { InvalidRefreshTokenError } from "@identity/domain/auth/erros/InvalidRefreshTokenError";

@SwaggerUseCaseMetadata({
    errors: [UserNotFoundError, InvalidRefreshTokenError],
    request: RefreshTokenRequestDto,
    response: LoginResponseDto,
    successStatus: DomainHttpCode.CREATED,
})

@Injectable()
export class RefreshTokenUseCase {
    constructor(private readonly userRepository: UserRepository, private readonly authRepository: AuthRepository) { }

    async execute(dto: RefreshTokenRequestDto): Promise<ResultValue<LoginResponseDto, UserNotFoundError | InvalidRefreshTokenError>> {

        const token = dto.refreshToken;

        const idResult = await this.authRepository.verifyRefreshToken(token);
        if (idResult.isFail) return ResultValue.error(new InvalidRefreshTokenError())

        const id = idResult.unwrap();        
        const userResult = await this.userRepository.findByID(id)
        if (userResult.isFail) {
            return ResultValue.error(new UserNotFoundError(id.value));
        }

        const userValue = userResult.unwrap();
        if (!userValue) {
            return ResultValue.error(new UserNotFoundError(id.value));
        }

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