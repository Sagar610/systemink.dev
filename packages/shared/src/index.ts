import { z } from 'zod';

// ============ ENUMS ============
export enum Role {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  AUTHOR = 'AUTHOR',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
}

export enum CommentStatus {
  VISIBLE = 'VISIBLE',
  HIDDEN = 'HIDDEN',
}

// ============ ZOD SCHEMAS ============

// Auth schemas
export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

// User schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z
    .string()
    .refine(
      (val) => {
        if (!val || val === null) return true; // null/undefined allowed
        // Accept full URLs (http:// or https://) OR relative paths starting with /uploads/
        return (
          val.startsWith('http://') ||
          val.startsWith('https://') ||
          val.startsWith('/uploads/')
        );
      },
      { message: 'Avatar URL must be a valid URL or a relative path starting with /uploads/' }
    )
    .optional()
    .nullable(),
  links: z.record(z.string().url()).optional(),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

// Post schemas
export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  contentMd: z.string().min(1),
  coverImageUrl: z.string().url().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  status: z.nativeEnum(PostStatus).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const updatePostSchema = createPostSchema.partial();

// Tag schemas
export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
});

// Comment schemas
export const createCommentSchema = z.object({
  body: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// ============ TYPE EXPORTS ============
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

// ============ RESPONSE TYPES ============
export interface UserPublic {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  links: Record<string, string>;
  createdAt: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  postCount?: number;
}

export interface UserPrivate extends UserPublic {
  email: string;
  role: Role;
}

export interface TagPublic {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export interface PostPublic {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string;
  coverImageUrl: string | null;
  readingTime: number;
  viewsCount: number;
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: UserPublic;
  tags: TagPublic[];
}

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  firstContentImageUrl?: string | null; // First image extracted from blog content
  readingTime: number;
  viewsCount: number;
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: UserPublic;
  tags: TagPublic[];
}

export interface PostDraft {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentMd: string;
  contentHtml: string;
  coverImageUrl: string | null;
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: TagPublic[];
}

export interface CommentPublic {
  id: string;
  body: string;
  status: CommentStatus;
  parentId: string | null;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  user: UserPublic;
  parent?: CommentPublic | null;
  replies?: CommentPublic[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: UserPrivate;
  accessToken: string;
}

// ============ UTILITY FUNCTIONS ============
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
