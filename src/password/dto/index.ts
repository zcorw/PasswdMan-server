import { IsOptional, IsString, IsNumber, Length } from 'class-validator';

export class CreatePasswordDto {
  @IsString()
  @Length(1, 300)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  uri: string;

  @IsString()
  @Length(1, 300)
  username: string;

  @IsString()
  @Length(1, 300)
  password: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  remark: string;

  @IsNumber()
  groupId: number;
}

export class UpdatePasswordDto {
  @IsOptional()
  @IsString()
  @Length(1, 300)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  uri: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  username: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  password: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  remark: string;

  @IsOptional()
  @IsNumber()
  groupId: number;
}
