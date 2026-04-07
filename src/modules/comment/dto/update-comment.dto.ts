import { IsEnum } from 'class-validator';
import { CommentStatus } from '@prisma/client';

export class UpdateCommentDto {
  @IsEnum(CommentStatus)
  status: CommentStatus;
}
