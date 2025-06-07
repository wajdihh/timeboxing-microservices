import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { RegisterUserRequestDto } from "./dto/RegisterUserRequestDto";
import { UserMapper } from "./dto/UserMapper";
import { PasswordHasherPort } from "../auth/utils/PasswordHasherPort";
import { UserAlreadyExistsError } from "@identity/domain/user/errors/UserAlreadyExistsError";
import { SuccessStatus, ResultValue, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { InvalidEmailError } from "@identity/domain/user/errors/InvalidEmailError";
import { EmailValue } from "@identity/domain/user/value-objects/EmailValue";
import { AuthResponseDto } from "../auth/dto/AuthResponseDto";
import { UserEntity } from "@identity/domain/user/UserEntity";

@SwaggerUseCaseMetadata({
    errors: [InvalidEmailError, UserAlreadyExistsError],
    request: RegisterUserRequestDto,
    response: AuthResponseDto,
    successStatus: SuccessStatus.CREATED,
})
@Injectable()
export class RegisterUserUseCase {

    constructor(private readonly userRepository: UserRepository, private readonly passwordHashPort: PasswordHasherPort) { }

    async execute(dto: RegisterUserRequestDto): Promise<ResultValue<UserEntity, UserAlreadyExistsError | InvalidEmailError>> {

        const email = dto.email;
        const emailResult = EmailValue.create(email);

        if (emailResult.isFail) return ResultValue.error(new InvalidEmailError(email));

        const emailValue = emailResult.unwrap();
        const hashedPassword = await this.passwordHashPort.hash(dto.password);
        const existingUser = await this.userRepository.findByEmail(emailValue);

        if (existingUser.isFail) return ResultValue.error(existingUser.error);
        if (existingUser.isOk && existingUser.unwrap()) return ResultValue.error(new UserAlreadyExistsError(dto.email));

        const user = UserMapper.toDomain(dto, hashedPassword).unwrap();
        await this.userRepository.save(user);
        return ResultValue.ok(user);

    }
}
