import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @IsString()
  @Length(2, 15)
  username: string;

  @IsString()
  @Length(6, 20)
  password: string;
}

export class RegisterDto extends LoginDto {}

export class EncryptDto {
  @IsString()
  data: string;

  @IsString()
  sign: string;

  @IsString()
  iv: string;

  @IsString()
  type: string;
}

export class EncryptLoginDto {
  @ValidateNested()
  @Type(() => EncryptDto)
  encryptData: EncryptDto;

  @IsString()
  aesKey: string;
}

export class UserDto {
  @IsString()
  @Length(2, 15)
  username: string;

  @IsOptional()
  @IsArray()
  roleIds: Array<number>;
}
