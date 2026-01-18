import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsEnum,
  IsObject,
  ValidateIf,
  Matches,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  bio?: string;

  @ValidateIf((o) => o.avatarUrl !== null && o.avatarUrl !== undefined)
  @IsString()
  @Matches(/^(https?:\/\/.+|\/uploads\/.+)$/, {
    message: 'Avatar URL must be a valid URL (http:// or https://) or a relative path starting with /uploads/',
  })
  @IsOptional()
  avatarUrl?: string | null;

  @IsObject()
  @IsOptional()
  links?: Record<string, string>;
}

export class UpdateRoleDto {
  @IsEnum(Role)
  role: Role;
}
