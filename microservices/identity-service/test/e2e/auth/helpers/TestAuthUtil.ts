import { INestApplication } from '@nestjs/common';
import { UserFactory } from '@timeboxing/shared';
import { GenerateAuthTokensService } from '@identity/application/user/GenerateAuthTokensService';
import { USER_REPOSITORY, UserRepository } from '@identity/domain/user/UserRepository';
import { PASSWORD_HASHER_PORT } from '@identity/infrastructure/auth/tools/BcryptPasswordAdapter';
import { AuthResponseDto } from '@identity/application/auth/dto/AuthResponseDto';
import { UserMapper } from '@identity/application/user/dto/UserMapper';

export async function createTestUserAndTokens(app: INestApplication): Promise<{ userId: string; tokens: AuthResponseDto }> {

  const userRepo = app.get<UserRepository>(USER_REPOSITORY);
  const hasher = app.get(PASSWORD_HASHER_PORT);
  const tokenService = app.get(GenerateAuthTokensService);

  const testUser = UserFactory.wajdi();
  const hashed = await hasher.hash(testUser.password);
  const userEntity = UserMapper.toDomain(testUser, hashed).unwrap();

  const existingUserResult = await userRepo.findByEmail(userEntity.email);
  let persistedUser = existingUserResult.isOk ? existingUserResult.unwrap() : null;

  if (!persistedUser) {
    await userRepo.save(userEntity);
    persistedUser = userEntity;
  }
    
  const tokens = await tokenService.execute(persistedUser);
  return { userId: persistedUser.id.value, tokens };
}