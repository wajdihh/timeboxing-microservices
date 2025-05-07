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

    findByID(id: ID): Promise<ResultValue<UserEntity | null>> {
        throw new Error('Method not implemented.');
    }


    //TODO: To replace by mock and see if it's relavant to keep it
}