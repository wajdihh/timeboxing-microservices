import { Module } from '@nestjs/common';
import { UserController } from './UserController';
import { InMemoryUserRepository } from './InMemoryUserRepository';
import { RegisterUserUseCase } from '@identity/application/user/RegisterUserUseCase';
import { BcryptPasswordAdapter } from '../security/BcryptPasswordAdapter';

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
  ],
})
export class UserModule {}
