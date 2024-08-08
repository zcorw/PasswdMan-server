import { IsOptional, IsString, Length } from 'class-validator';

export class CreatePasswordDto {
  @IsString()
  @Length(1, 300)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  uri: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  username: string;

  @IsString()
  @Length(1, 300)
  password: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  remark: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  fields: string;

  @IsString()
  groupId: number;
}

export class UpdatePasswordDto {
  @IsOptional()
  @IsString()
  @Length(1, 300)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  uri: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  username: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  password: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  remark: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  fields: string;
}
