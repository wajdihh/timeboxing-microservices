import { UserEntity } from "@identity/domain/user/UserEntity";
import { Prisma, User } from "generated/prisma";

export class UserPrismaMapper {
    static toEntity(user: User): UserEntity {
        return UserEntity.restore({
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }).unwrap();
      }
    
      static toPersistence(entity: UserEntity): Prisma.UserCreateInput {
        return {
          id: entity.id.value,
          name: entity.name,
          email: entity.email.value,
          passwordHash: entity.passwordHash,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        };
      }
}
