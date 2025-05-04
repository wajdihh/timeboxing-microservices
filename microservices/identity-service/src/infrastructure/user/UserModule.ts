import { Module } from '@nestjs/common';
import { UserController } from './UserController';
import { InMemoryUserRepository } from './InMemoryUserRepository';
import { RegisterUserUseCase } from '@identity/application/user/RegisterUserUseCase';
import { BcryptPasswordAdapter } from '../security/BcryptPasswordAdapter';
import { GetUserUseCase } from '@identity/application/user/GetUserUseCase';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: 'InMemoryUserRepository',
      useClass: InMemoryUserRepository,
    },
    {
          provide: 'BcryptPasswordAdapter',
          useClass: BcryptPasswordAdapter,
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (repo: InMemoryUserRepository, port: BcryptPasswordAdapter) =>
      new RegisterUserUseCase(repo, port),
      inject: ['InMemoryUserRepository', 'BcryptPasswordAdapter'],
    },
    {
      provide: GetUserUseCase,
      useFactory: (repo: InMemoryUserRepository) =>
      new GetUserUseCase(repo),
      inject: ['InMemoryUserRepository'],
    },
  ],
})
export class UserModule {}
