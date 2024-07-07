import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  Length,
  Min,
} from 'class-validator';

export class CreatePasswordDto {
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

export class FindPasswordDto {
  @IsOptional()
  @IsInt()
  groupId: number;

  @IsInt()
  @Min(1)
  page: number;

  @IsInt()
  @Min(1)
  limit: number;
}
