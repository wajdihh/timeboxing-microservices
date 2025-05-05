import { Module } from '@nestjs/common';
import { UserController } from './UserController';
import { RegisterUserUseCase } from '@identity/application/user/RegisterUserUseCase';
import { BcryptPasswordAdapter } from '../security/BcryptPasswordAdapter';
import { GetUserUseCase } from '@identity/application/user/GetUserUseCase';
import { PrismaUserRepository } from './PrismaUserRepository';
import { PrismaService } from '../prisma/PrismaService';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    {
      provide: 'PrismaUserRepository',
      useClass: PrismaUserRepository,
    },
    {
          provide: 'BcryptPasswordAdapter',
          useClass: BcryptPasswordAdapter,
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (repo: PrismaUserRepository, port: BcryptPasswordAdapter) =>
      new RegisterUserUseCase(repo, port),
      inject: ['PrismaUserRepository', 'BcryptPasswordAdapter'],
    },
    {
      provide: GetUserUseCase,
      useFactory: (repo: PrismaUserRepository) =>
      new GetUserUseCase(repo),
      inject: ['PrismaUserRepository'],
    },
  ],
})
export class UserModule {}
