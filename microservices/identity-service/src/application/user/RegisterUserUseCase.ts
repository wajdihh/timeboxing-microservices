import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { RegisterUserRequestDto } from "./dto/RegisterUserRequestDto";
import { RegisterUserMapper } from "./mappers/RegisterUserMapper";
import { PasswordHasherPort } from "../security/PasswordHasherPort";
import { UserResponseDto } from "./dto/UserResponseDto";
import { UserAlreadyExistsError } from "@identity/domain/user/errors/UserAlreadyExistsError";
import { DomainHttpCode, ResultValue, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { InvalidEmailError } from "@identity/domain/user/errors/InvalidEmailError";
import { EmailValue } from "@identity/domain/user/value-objects/EmailValue";

@SwaggerUseCaseMetadata({
    errors: [InvalidEmailError, UserAlreadyExistsError],
    request: RegisterUserRequestDto,
    response: UserResponseDto,
    successStatus: DomainHttpCode.CREATED,
})
@Injectable()
export class RegisterUserUseCase {

    constructor(private readonly userRepository: UserRepository, private readonly passwordHashPort: PasswordHasherPort) { }

    async execute(dto: RegisterUserRequestDto): Promise<ResultValue<UserResponseDto, UserAlreadyExistsError | InvalidEmailError>> {

        const email = dto.email;
        const emailResult = EmailValue.create(email);
        // 1. Invalid email format
        if (!emailResult.isOk) {
            return ResultValue.error(new InvalidEmailError(email));
        }

        const emailValue = emailResult.unwrap();
        const hashedPassword = await this.passwordHashPort.hash(dto.password);
        const existingUser = await this.userRepository.findByEmail(emailValue);

        // 1. Invalid email format
        if (!existingUser.isOk) {
            return ResultValue.error(existingUser.error);
        }

        // 2. Email exists → User already exists
        if (existingUser.isOk && existingUser.unwrap()) {
            return ResultValue.error(new UserAlreadyExistsError(dto.email));
        }

        const user = RegisterUserMapper.toDomain(dto, hashedPassword).unwrap();

        await this.userRepository.save(user);

        const response = RegisterUserMapper.toResponse(user);

        return ResultValue.ok(response);

    }
}