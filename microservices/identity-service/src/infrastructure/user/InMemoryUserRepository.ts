import { Injectable } from '@nestjs/common';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { UserRepository } from '@identity/domain/user/UserRepository';
import { EmailValue } from '@identity/domain/user/value-objects/EmailValue';
import { ID, ResultValue } from '@timeboxing/shared';

@Injectable()
export class InMemoryUserRepository implements UserRepository {

    private users: UserEntity[] = [];

    async findByEmail(email: EmailValue): Promise<ResultValue<UserEntity | null>> {

        const user = this.users.find(user => user.email.equals(email));

        return ResultValue.ok(user ?? null);
    }


    async save(user: UserEntity): Promise<void> {
        this.users.push(user);
        return Promise.resolve();
    }

    async findByID(id: ID): Promise<ResultValue<UserEntity | null>> {
        const user = this.users.find(u => u.id.equals(id));
        return ResultValue.ok(user ?? null);
    }

    async delete(id: ID): Promise<void> {
        this.users = this.users.filter(u => !u.id.equals(id));
    }

}
