import { Module, forwardRef } from '@nestjs/common'; // Import forwardRef
import { UserController } from './UserController';
import { RegisterUserUseCase } from '@identity/application/user/RegisterUserUseCase';
import { BcryptPasswordAdapter, PASSWORD_HASHER_PORT } from '../auth/tools/BcryptPasswordAdapter';
import { GetUserUseCase } from '@identity/application/user/GetUserUseCase';
import { PrismaUserRepository } from './PrismaUserRepository';
import { PrismaModule } from '../prisma/PrismaModule';
import { USER_REPOSITORY } from '@identity/domain/user/UserRepository';
import { AuthModule } from '../auth/AuthModule';
import { DeleteUserUseCase } from '@identity/application/user/DeleteUserUseCase';
import { TOKEN_REPOSITORY } from '@identity/domain/auth/TokenRepository';
import { PROMETHEUSE_METRICS_ADAPTER } from '../observability/metrics/PrometheusMetricsAdapter'; // PrometheusMetricsAdapter class import removed

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)], // Use forwardRef here
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER_PORT, useClass: BcryptPasswordAdapter },

    {
      provide: RegisterUserUseCase,
      useFactory: (repo, port, metrics) => new RegisterUserUseCase(repo, port, metrics),
      inject: [USER_REPOSITORY, PASSWORD_HASHER_PORT, PROMETHEUSE_METRICS_ADAPTER],
    },
    {
      provide: GetUserUseCase,
      useFactory: (repo) => new GetUserUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (repo, tokenRepo) => new DeleteUserUseCase(repo, tokenRepo),
      inject: [USER_REPOSITORY, TOKEN_REPOSITORY],
    },
  ],
  exports: [RegisterUserUseCase], 
})
export class UserModule {}
