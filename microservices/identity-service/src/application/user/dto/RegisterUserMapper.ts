import { UserEntity } from "@identity/domain/user/UserEntity";
import { RegisterUserRequestDto } from "./RegisterUserRequestDto";
import { UserResponseDto } from "./UserResponseDto";
import { ResultValue } from "@timeboxing/shared";
import { InvalidEmailError } from "@identity/domain/user/errors/InvalidEmailError";

export class RegisterUserMapper {
    static toDomain(dto: RegisterUserRequestDto, hashedPassword: string): ResultValue<UserEntity, InvalidEmailError> {
      return UserEntity.create(dto.name, dto.email, hashedPassword);
    }
  
    static toResponse(user: UserEntity):UserResponseDto {
      return {
        id: user.id.value,
        name: user.name,
        email: user.email.value,
        createdAt: user.createdAt.toISOString(),
      };
    }
}