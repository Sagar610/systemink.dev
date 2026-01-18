import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  @IsOptional()
  slug?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  excerpt?: string;

  @IsString()
  @MinLength(1)
  contentMd: string;

  @IsUrl()
  @IsOptional()
  coverImageUrl?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string | null;
}

export class UpdatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  @IsOptional()
  slug?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  excerpt?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  contentMd?: string;

  @IsUrl()
  @IsOptional()
  coverImageUrl?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string | null;
}

export class PostQueryDto {
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  q?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;
}
