import { IsOptional, IsString, IsInt, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNoteDto {
  @IsString()
  @Length(1, 300)
  name: string;

  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  uri: string;

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

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @Length(1, 300)
  name: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  uri: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  remark: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  fields: string;
}

export class FindNoteByIdDto {
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

export class FindByPageDto {
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

export class OneByIdDto {
  @IsInt()
  @Min(0)
  @Type(() => Number)
  id: number;
}
