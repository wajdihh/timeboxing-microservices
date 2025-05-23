import { Module } from '@nestjs/common';
import { UserController } from './UserController';
import { RegisterUserUseCase } from '@identity/application/user/RegisterUserUseCase';
import { BcryptPasswordAdapter, PASSWORD_HASHER_PORT } from '../auth/tools/BcryptPasswordAdapter';
import { GetUserUseCase } from '@identity/application/user/GetUserUseCase';
import { PrismaUserRepository } from './PrismaUserRepository';
import { PrismaModule } from '../prisma/PrismaModule';
import { USER_REPOSITORY } from '@identity/domain/user/UserRepository';
import { AuthModule } from '../auth/AuthModule';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER_PORT, useClass: BcryptPasswordAdapter },

    {
      provide: RegisterUserUseCase,
      useFactory: (repo, port) => new RegisterUserUseCase(repo, port),
      inject: [USER_REPOSITORY, PASSWORD_HASHER_PORT],
    },
    {
      provide: GetUserUseCase,
      useFactory: (repo) => new GetUserUseCase(repo),
      inject: [USER_REPOSITORY],
    },
  ],
})
export class UserModule {}
