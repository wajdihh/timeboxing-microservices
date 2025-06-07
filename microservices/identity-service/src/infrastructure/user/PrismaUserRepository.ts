import { UserEntity } from "@identity/domain/user/UserEntity";
import { UserRepository } from "@identity/domain/user/UserRepository";
import { EmailValue } from "@identity/domain/user/value-objects/EmailValue";
import { ID, ResultValue } from "@timeboxing/shared";
import { PrismaService } from "../prisma/PrismaService";
import { UserPrismaMapper } from "./UserPrismaMapper";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaUserRepository implements UserRepository {

    constructor(private readonly prismaService: PrismaService) { }
    async findByEmail(email: EmailValue): Promise<ResultValue<UserEntity | null>> {
        const user = await this.prismaService.user.findUnique({ where: { email: email.value, } });

        if (!user) return ResultValue.ok(null);
        const userEntity = UserPrismaMapper.toEntity(user);
        return ResultValue.ok(userEntity);
    }

    async save(user: UserEntity): Promise<void> {
        const userPrisma = UserPrismaMapper.toPersistence(user);
        await this.prismaService.user.create({ data: userPrisma });
    }

    async findByID(id: ID): Promise<ResultValue<UserEntity | null>> {
        const user = await this.prismaService.user.findUnique({ where: { id: id.value, } });
        if (!user) return ResultValue.ok(null);
        const userEntity = UserPrismaMapper.toEntity(user);
        return ResultValue.ok(userEntity);
    }

    async delete(id: ID): Promise<void> {
        await this.prismaService.user.delete({ where: { id: id.value } });
    }
}
