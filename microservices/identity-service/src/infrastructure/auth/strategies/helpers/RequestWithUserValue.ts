import { UserEntity } from "@identity/domain/user/UserEntity";

export interface RequestWithUser extends Request {
  user: UserEntity;
}
