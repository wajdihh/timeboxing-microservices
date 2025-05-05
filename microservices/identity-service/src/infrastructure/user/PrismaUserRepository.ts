import { UserEntity } from "@identity/domain/user/UserEntity";
import { UserRepository } from "@identity/domain/user/UserRepository";
import { EmailValue } from "@identity/domain/user/value-objects/EmailValue";
import { ResultValue } from "@timeboxing/shared";
import { PrismaService } from "../prisma/PrismaService";
import { UserPrismaMapper } from "./UserPrismaMapper";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaUserRepository implements UserRepository {

    constructor(private readonly prismaService: PrismaService) { }
    async findByEmail(email: EmailValue): Promise<ResultValue<UserEntity | null>> {
        const user = await this.prismaService.user.findUnique({ where: { email: email.value, } });
        // 1. User not found
        if (!user) return ResultValue.ok(null);
        const userEntity = UserPrismaMapper.toEntity(user);
        return ResultValue.ok(userEntity);
    }

    async save(user: UserEntity): Promise<void> {
        const userPrisma = UserPrismaMapper.toPersistence(user);
        await this.prismaService.user.create({data: userPrisma});
    }
}