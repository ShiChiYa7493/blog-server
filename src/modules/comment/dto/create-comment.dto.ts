import { IsString, IsEmail, IsOptional, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  nickname: string;

  @IsEmail()
  email: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  parentId?: number;
}
