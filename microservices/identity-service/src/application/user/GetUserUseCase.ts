import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { UserResponseDto } from "./dto/UserResponseDto";
import { UserNotFoundError } from "@identity/domain/user/errors/UserNotFoundError";
import { DomainHttpCode, ResultValue, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { InvalidEmailError } from "@identity/domain/user/errors/InvalidEmailError";
import { RegisterUserMapper } from "./dto/RegisterUserMapper";
import { EmailValue } from "@identity/domain/user/value-objects/EmailValue";

@SwaggerUseCaseMetadata({
    errors: [UserNotFoundError, InvalidEmailError],
    response: UserResponseDto,
    successStatus: DomainHttpCode.OK,
})
@Injectable()
export class GetUserUseCase {

    constructor(private readonly userRepository: UserRepository) { }

    async execute(email: string): Promise<ResultValue<UserResponseDto, UserNotFoundError | InvalidEmailError>> {

        const emailResult = EmailValue.create(email);
        if (!emailResult.isOk) return ResultValue.error(new InvalidEmailError(email));

        const emailValue = emailResult.unwrap();
        const userResult = await this.userRepository.findByEmail(emailValue);
        const userValue = userResult.unwrap();

        if (!userValue) return ResultValue.error(new UserNotFoundError(email));

        const response = RegisterUserMapper.toResponse(userValue);
        return ResultValue.ok(response);

    }
}