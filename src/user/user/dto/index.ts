import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(2, 15)
  username: string;

  @IsString()
  @Length(6, 20)
  password: string;
}

export class RegisterDto extends LoginDto {}

export class UserDto {
  @IsString()
  @Length(2, 15)
  username: string;

  @IsOptional()
  @IsArray()
  roleIds: Array<number>;
}
