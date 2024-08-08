import { IsOptional, IsString, IsInt, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindByIdDto {
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
