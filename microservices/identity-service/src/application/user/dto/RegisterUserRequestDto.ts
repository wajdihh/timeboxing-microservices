import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { UserFactory } from '@timeboxing/shared';

export class RegisterUserRequestDto {

  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email!: string;

  @Expose()
  @IsString()
  @Length(8, 32)
  password!: string;

    
   static sample(): RegisterUserRequestDto {
    const userFake = UserFactory.withAllFields();
    return {
      name: userFake.name,
      email: userFake.email,
      password: userFake.password,
    };  
  }
}
