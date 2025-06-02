import { InvalidEmailError } from "@identity/domain/user/errors/InvalidEmailError";
import { UserEntity } from "@identity/domain/user/UserEntity";
import { InvalidIDError } from "@timeboxing/shared";

describe('UserEntity', () => {
  it('should create a user with valid email', () => {
    const result = UserEntity.create('John Doe', 'john@example.com', 'hashedPassword');
    expect(result.isOk).toBe(true);
    const user = result.unwrap();
    expect(user.email.value).toBe('john@example.com');
  });

  it('should return an error for invalid email', () => {
    const result = UserEntity.create('John Doe', 'invalidEmail', 'hashedPassword');
    expect(result.isOk).toBe(false);
  });

  it('should return an error when restoring user with invalid email', () => {
  const props = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe', 
    email: 'invalidEmail',
    passwordHash: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const result = UserEntity.restore(props);
  expect(result.isOk).toBe(false);
  expect(result.error).toBeInstanceOf(InvalidEmailError);
});

  it('should return an error when restoring user with invalid ID', () => {
  const props = {
    id: 'invalidID',
    name: 'John Doe', 
    email: 'john@example.com',
    passwordHash: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const result = UserEntity.restore(props);
  expect(result.isOk).toBe(false);
  expect(result.error).toBeInstanceOf(InvalidIDError);
});

  it('should successfully restore a user with valid props', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000'; // A valid UUID
    const props = {
      id: validId,
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'anotherHashedPassword',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = UserEntity.restore(props);
    expect(result.isOk).toBe(true);
    const user = result.unwrap();
    expect(user).toBeInstanceOf(UserEntity);
    expect(user.id.value).toBe(validId);
    expect(user.name).toBe(props.name);
    expect(user.email.value).toBe(props.email);
    expect(user.passwordHash).toBe(props.passwordHash);
    expect(user.createdAt).toEqual(props.createdAt);
    expect(user.updatedAt).toEqual(props.updatedAt);
  });
});
