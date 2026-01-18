import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, Role, PostStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MarkdownService } from './markdown.service';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto';
import { slugify } from '@systemink/shared';
import * as crypto from 'crypto';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private markdownService: MarkdownService,
  ) {}

  private readonly postSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    contentHtml: true,
    coverImageUrl: true,
    readingTime: true,
    viewsCount: true,
    status: true,
    scheduledAt: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    author: {
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
        links: true,
        createdAt: true,
      },
    },
    tags: {
      select: {
        tag: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
  };

  private readonly listSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    coverImageUrl: true,
    contentHtml: true, // Include content HTML to extract first image
    readingTime: true,
    viewsCount: true,
    status: true,
    scheduledAt: true,
    publishedAt: true,
    createdAt: true,
    author: {
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
      },
    },
    tags: {
      select: {
        tag: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
  };

  async create(userId: string, dto: CreatePostDto) {
    // Auto-generate slug if not provided
    let slug = dto.slug;
    if (!slug && dto.title) {
      slug = slugify(dto.title);
    }
    if (!slug) {
      throw new BadRequestException('Title is required to generate slug');
    }

    // Ensure slug is unique
    let uniqueSlug = slug;
    let counter = 1;
    let existingSlug = await this.prisma.post.findUnique({
      where: { slug: uniqueSlug },
    });
    while (existingSlug) {
      uniqueSlug = `${slug}-${counter}`;
      existingSlug = await this.prisma.post.findUnique({
        where: { slug: uniqueSlug },
      });
      counter++;
    }
    slug = uniqueSlug;

    // Convert markdown to HTML
    let contentHtml = await this.markdownService.toHtml(dto.contentMd);
    contentHtml = this.markdownService.addHeadingIds(contentHtml);
    const readingTime = this.markdownService.calculateReadingTime(dto.contentMd);

    // Handle status and dates
    let status = dto.status || PostStatus.DRAFT;
    let publishedAt: Date | null = null;
    let scheduledAt: Date | null = null;

    if (status === PostStatus.PUBLISHED) {
      publishedAt = new Date();
    } else if (status === PostStatus.SCHEDULED && dto.scheduledAt) {
      scheduledAt = new Date(dto.scheduledAt);
      if (scheduledAt <= new Date()) {
        throw new BadRequestException('Scheduled date must be in the future');
      }
    }

    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        title: dto.title,
        slug: slug,
        excerpt: dto.excerpt,
        contentMd: dto.contentMd,
        contentHtml,
        status,
        scheduledAt,
        publishedAt,
        coverImageUrl: dto.coverImageUrl,
        readingTime,
        tags: dto.tagIds?.length
          ? {
              create: dto.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      select: this.postSelect,
    });

    return this.transformPost(post);
  }

  async update(postId: string, userId: string, userRole: Role, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check permissions
    if (post.authorId !== userId && userRole !== Role.ADMIN && userRole !== Role.EDITOR) {
      throw new ForbiddenException('Not authorized to edit this post');
    }

    // Check slug uniqueness if changed
    if (dto.slug && dto.slug !== post.slug) {
      const existingSlug = await this.prisma.post.findUnique({
        where: { slug: dto.slug },
      });
      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }
    }

    // Prepare update data
    const updateData: Prisma.PostUpdateInput = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.excerpt !== undefined) updateData.excerpt = dto.excerpt;
    if (dto.coverImageUrl !== undefined) updateData.coverImageUrl = dto.coverImageUrl;

    // Handle content update
    if (dto.contentMd !== undefined) {
      let contentHtml = await this.markdownService.toHtml(dto.contentMd);
      contentHtml = this.markdownService.addHeadingIds(contentHtml);
      updateData.contentMd = dto.contentMd;
      updateData.contentHtml = contentHtml;
      updateData.readingTime = this.markdownService.calculateReadingTime(dto.contentMd);
    }

    // Handle status changes
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === PostStatus.PUBLISHED && !post.publishedAt) {
        updateData.publishedAt = new Date();
        updateData.scheduledAt = null;
      } else if (dto.status === PostStatus.SCHEDULED && dto.scheduledAt) {
        const scheduledAt = new Date(dto.scheduledAt);
        if (scheduledAt <= new Date()) {
          throw new BadRequestException('Scheduled date must be in the future');
        }
        updateData.scheduledAt = scheduledAt;
        updateData.publishedAt = null;
      } else if (dto.status === PostStatus.DRAFT) {
        updateData.scheduledAt = null;
      }
    }

    // Handle tags update
    if (dto.tagIds !== undefined) {
      await this.prisma.postTag.deleteMany({
        where: { postId },
      });
      if (dto.tagIds.length > 0) {
        await this.prisma.postTag.createMany({
          data: dto.tagIds.map((tagId) => ({ postId, tagId })),
        });
      }
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: updateData,
      select: this.postSelect,
    });

    return this.transformPost(updated);
  }

  async publish(postId: string, userId: string, userRole: Role) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && userRole !== Role.ADMIN && userRole !== Role.EDITOR) {
      throw new ForbiddenException('Not authorized to publish this post');
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: post.publishedAt || new Date(),
        scheduledAt: null,
      },
      select: this.postSelect,
    });

    return this.transformPost(updated);
  }

  async unpublish(postId: string, userId: string, userRole: Role) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && userRole !== Role.ADMIN && userRole !== Role.EDITOR) {
      throw new ForbiddenException('Not authorized to unpublish this post');
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.DRAFT,
      },
      select: this.postSelect,
    });

    return this.transformPost(updated);
  }

  async delete(postId: string, userId: string, userRole: Role) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized to delete this post');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug, status: PostStatus.PUBLISHED },
      select: this.postSelect,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.transformPost(post);
  }

  async findBySlugForEdit(slug: string, userId: string, userRole: Role) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      select: {
        ...this.postSelect,
        contentMd: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user can edit (for dashboard/editor access)
    const authorId = (post as any).author?.id;
    if (authorId !== userId && userRole !== Role.ADMIN && userRole !== Role.EDITOR) {
      throw new ForbiddenException('Not authorized to access this post');
    }

    return this.transformPost(post);
  }

  async findById(id: string, userId: string, userRole: Role) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: {
        ...this.postSelect,
        contentMd: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const authorId = (post as any).author?.id;
    if (authorId !== userId && userRole !== Role.ADMIN && userRole !== Role.EDITOR) {
      throw new ForbiddenException('Not authorized to access this post');
    }

    return this.transformPost(post);
  }

  async findPublished(query: PostQueryDto) {
    const { page = 1, limit = 10, tag, author, q } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      status: PostStatus.PUBLISHED,
    };

    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag },
        },
      };
    }

    if (author) {
      where.author = { username: author };
    }

    if (q) {
      // Full-text search using Postgres
      where.OR = [
        {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          contentMd: {
            contains: q,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        select: this.listSelect,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts.map((p) => this.transformPost(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFeatured(limit: number = 6) {
    const posts = await this.prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      select: this.listSelect,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return posts.map((p) => this.transformPost(p));
  }

  async findTrending(limit: number = 6) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get posts with most views in the last 7 days
    const posts = await this.prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        views: {
          some: {
            viewedAt: { gte: sevenDaysAgo },
          },
        },
      },
      select: {
        ...this.listSelect,
        _count: {
          select: {
            views: {
              where: { viewedAt: { gte: sevenDaysAgo } },
            },
          },
        },
      },
      orderBy: {
        views: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    // If not enough trending posts, fill with recent posts
    if (posts.length < limit) {
      const additionalPosts = await this.prisma.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
          id: { notIn: posts.map((p) => p.id) },
        },
        select: this.listSelect,
        orderBy: { viewsCount: 'desc' },
        take: limit - posts.length,
      });

      return [...posts, ...additionalPosts].map((p) => this.transformPost(p));
    }

    return posts.map((p) => this.transformPost(p));
  }

  async findByAuthor(username: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          author: { username },
          status: PostStatus.PUBLISHED,
        },
        select: this.listSelect,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({
        where: {
          author: { username },
          status: PostStatus.PUBLISHED,
        },
      }),
    ]);

    return {
      data: posts.map((p) => this.transformPost(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findUserPosts(userId: string, query: PostQueryDto) {
    const { page = 1, limit = 10, status, tag } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      authorId: userId,
    };

    if (status) {
      where.status = status as PostStatus;
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag },
        },
      };
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        select: this.listSelect,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts.map((p) => this.transformPost(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findRelated(slug: string, limit: number = 4) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        tags: {
          select: { tagId: true },
        },
      },
    });

    if (!post) {
      return [];
    }

    const tagIds = post.tags.map((t) => t.tagId);

    if (tagIds.length === 0) {
      // No tags, return recent posts
      const posts = await this.prisma.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
          id: { not: post.id },
        },
        select: this.listSelect,
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });
      return posts.map((p) => this.transformPost(p));
    }

    const posts = await this.prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        id: { not: post.id },
        tags: {
          some: {
            tagId: { in: tagIds },
          },
        },
      },
      select: this.listSelect,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return posts.map((p) => this.transformPost(p));
  }

  async incrementView(postId: string, ip: string) {
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

    // Check if this IP viewed this post in the last hour
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recentView = await this.prisma.postView.findFirst({
      where: {
        postId,
        ipHash,
        viewedAt: { gte: oneHourAgo },
      },
    });

    if (recentView) {
      return { counted: false };
    }

    // Record view and increment count
    await this.prisma.$transaction([
      this.prisma.postView.create({
        data: { postId, ipHash },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { viewsCount: { increment: 1 } },
      }),
    ]);

    return { counted: true };
  }

  async search(q: string, page: number = 1, limit: number = 10) {
    if (!q || !q.trim()) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    const skip = (page - 1) * limit;
    const searchTerm = q.trim();

    try {
      // Try Postgres full-text search first
      const posts = await this.prisma.$queryRaw<any[]>`
        SELECT 
          p.id, p.title, p.slug, p.excerpt, p."coverImageUrl", 
          p."readingTime", p."viewsCount", p.status, 
          p."publishedAt", p."createdAt",
          u.id as "authorId", u.name as "authorName", 
          u.username as "authorUsername", u."avatarUrl" as "authorAvatarUrl",
          ts_rank(
            to_tsvector('english', p.title || ' ' || p."contentMd"),
            plainto_tsquery('english', ${searchTerm})
          ) as rank
        FROM "Post" p
        JOIN "User" u ON p."authorId" = u.id
        WHERE p.status = 'PUBLISHED'
          AND to_tsvector('english', p.title || ' ' || p."contentMd") @@ plainto_tsquery('english', ${searchTerm})
        ORDER BY rank DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `;

      const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM "Post" p
        WHERE p.status = 'PUBLISHED'
          AND to_tsvector('english', p.title || ' ' || p."contentMd") @@ plainto_tsquery('english', ${searchTerm})
      `;

      const total = Number(countResult[0]?.count || 0);

      if (posts.length > 0 || total > 0) {
        // Get tags for posts from full-text search
        const postIds = posts.map((p) => p.id);
        const postTags = await this.prisma.postTag.findMany({
          where: { postId: { in: postIds } },
          include: { tag: true },
        });

        const tagsByPostId = postTags.reduce(
          (acc, pt) => {
            if (!acc[pt.postId]) acc[pt.postId] = [];
            acc[pt.postId].push(pt.tag);
            return acc;
          },
          {} as Record<string, any[]>,
        );

        const data = posts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          coverImageUrl: p.coverImageUrl,
          readingTime: p.readingTime,
          viewsCount: p.viewsCount,
          status: p.status,
          publishedAt: p.publishedAt,
          createdAt: p.createdAt,
          author: {
            id: p.authorId,
            name: p.authorName,
            username: p.authorUsername,
            avatarUrl: p.authorAvatarUrl,
          },
          tags: tagsByPostId[p.id] || [],
        }));

        return {
          data,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      }
    } catch (error) {
      // If full-text search fails, fall back to simple LIKE search
      console.warn('Full-text search failed, falling back to LIKE search:', error);
    }

    // Fallback to simple LIKE search
    const where: Prisma.PostWhereInput = {
      status: PostStatus.PUBLISHED,
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { contentMd: { contains: searchTerm, mode: 'insensitive' } },
        { excerpt: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    const [fallbackPosts, fallbackTotal] = await Promise.all([
      this.prisma.post.findMany({
        where,
        select: this.listSelect,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: fallbackPosts.map((p) => this.transformPost(p)),
      meta: {
        total: fallbackTotal,
        page,
        limit,
        totalPages: Math.ceil(fallbackTotal / limit),
      },
    };
  }

  async publishScheduled() {
    const now = new Date();

    const posts = await this.prisma.post.updateMany({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledAt: { lte: now },
      },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: now,
        scheduledAt: null,
      },
    });

    return posts.count;
  }

  // Extract the first image URL from HTML content
  private extractFirstImageUrl(html: string | null | undefined): string | null {
    if (!html) return null;
    
    // Match <img> tags and extract src attribute
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
    const match = html.match(imgRegex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  }

  private transformPost(post: any) {
    // Extract first image from content if available
    const firstContentImageUrl = this.extractFirstImageUrl(post.contentHtml);
    
    // Determine if this is a full post view or a list item
    // Full post views include 'updatedAt', list items don't
    // Also check for 'contentMd' which is present in edit views
    const isFullPostView = post.updatedAt !== undefined || post.contentMd !== undefined;
    
    // Remove contentHtml from list responses to keep payload small
    // Keep it for full post views where we need to display the content
    let basePost = post;
    if (!isFullPostView) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { contentHtml: _contentHtml, ...postWithoutContent } = post;
      basePost = postWithoutContent;
    }
    
    return {
      ...basePost,
      firstContentImageUrl, // Add extracted image URL
      tags: post.tags?.map((t: any) => t.tag) || [],
      author: post.author
        ? {
            ...post.author,
            links:
              typeof post.author.links === 'string'
                ? JSON.parse(post.author.links)
                : post.author.links,
          }
        : undefined,
    };
  }
}
