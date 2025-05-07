import { UserFactory } from '@timeboxing/shared';
import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginRequestDto {
    @Expose()
    @IsEmail()
    @Transform(({ value }) => value.trim().toLowerCase())
    email!: string;
  
    @Expose()
    @IsString()
    @Length(8, 32)
    password!: string;
  
     static sample(): LoginRequestDto {
      const userFake = UserFactory.wajdi();
      return {
        email: userFake.email,
        password: userFake.password,
      };  
    }
}
