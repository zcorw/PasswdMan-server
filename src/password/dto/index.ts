import { IsOptional, IsString, IsInt, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
}

export class FindPasswordByIdDto {
  @IsOptional()
  @IsString()
  @Length(0, 300)
  text: string;

  @IsOptional()
  @IsString()
  groupId: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  id: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number;
}

export class FindPasswordByPageDto {
  @IsOptional()
  @IsInt()
  groupId: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  page: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number;
}

export class OnePasswordByIdDto {
  @IsInt()
  @Min(0)
  @Type(() => Number)
  id: number;
}
