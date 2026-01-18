import { IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { CommentStatus } from '@prisma/client';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class ModerateCommentDto {
  @IsEnum(CommentStatus)
  status: CommentStatus;
}
