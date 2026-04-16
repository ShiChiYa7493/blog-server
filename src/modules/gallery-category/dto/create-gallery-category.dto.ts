import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateGalleryCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
