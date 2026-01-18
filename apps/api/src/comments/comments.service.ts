import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Role, CommentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  private async loadRepliesForComment(
    commentId: string,
    userId?: string,
  ): Promise<any[]> {
    // Get direct replies
    const replies = await this.prisma.comment.findMany({
      where: {
        parentId: commentId,
        status: CommentStatus.VISIBLE,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        parent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: { likes: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // For each reply, recursively load its nested replies
    const repliesWithNested = await Promise.all(
      replies.map(async (reply) => {
        const nestedReplies = await this.loadRepliesForComment(reply.id, userId);
        const likesCount = reply._count?.likes || reply.likesCount || 0;
        let isLiked = false;
        if (userId) {
          const userLike = await this.prisma.commentLike.findUnique({
            where: {
              commentId_userId: {
                commentId: reply.id,
                userId,
              },
            },
          });
          isLiked = !!userLike;
        }

        return {
          ...reply,
          likesCount,
          isLiked,
          replies: nestedReplies,
          _count: undefined,
        };
      }),
    );

    return repliesWithNested;
  }

  private async enrichCommentWithReplies(
    comment: any,
    userId?: string,
  ): Promise<any> {
    const likesCount = comment._count?.likes || comment.likesCount || 0;
    let isLiked = false;
    if (userId) {
      const userLike = await this.prisma.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId: comment.id,
            userId,
          },
        },
      });
      isLiked = !!userLike;
    }

    // Load all nested replies recursively
    const replies = await this.loadRepliesForComment(comment.id, userId);

    return {
      ...comment,
      likesCount,
      isLiked,
      replies,
      _count: undefined,
    };
  }

  async findByPostId(postId: string, page: number = 1, limit: number = 20, userId?: string) {
    // Get top-level comments (no parentId) only
    const topLevelComments = await this.prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
        status: CommentStatus.VISIBLE,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { likes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.comment.count({
      where: {
        postId,
        parentId: null,
        status: CommentStatus.VISIBLE,
      },
    });

    // Recursively load all replies with likes for each top-level comment
    const commentsWithLikes = await Promise.all(
      topLevelComments.map((comment) => this.enrichCommentWithReplies(comment, userId)),
    );

    return {
      data: commentsWithLikes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(postId: string, userId: string, dto: CreateCommentDto) {
    // Verify post exists and is published
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== 'PUBLISHED') {
      throw new BadRequestException('Cannot comment on unpublished post');
    }

    // If this is a reply, verify parent comment exists and belongs to same post
    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.postId !== postId) {
        throw new BadRequestException('Parent comment does not belong to this post');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        userId,
        parentId: dto.parentId || null,
        body: dto.body,
        likesCount: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        parent: dto.parentId ? {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        } : false,
        _count: {
          select: { likes: true },
        },
      },
    });

    // Enrich with like status
    const enrichedComment = await this.enrichCommentWithReplies(comment, userId);
    
    return enrichedComment;
  }

  async delete(
    commentId: string,
    userId: string,
    userRole: Role,
    postAuthorId: string,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check permissions: admin can delete any, post author can delete on their posts, user can delete own
    const canDelete =
      userRole === Role.ADMIN ||
      postAuthorId === userId ||
      comment.userId === userId;

    if (!canDelete) {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    // Soft delete by setting status to HIDDEN
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { status: CommentStatus.HIDDEN },
    });

    return { message: 'Comment deleted successfully' };
  }

  async moderate(commentId: string, status: CommentStatus) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { status },
    });

    return { message: 'Comment moderated successfully' };
  }

  async toggleLike(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await this.prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });
      await this.prisma.comment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });
      return { liked: false, likesCount: comment.likesCount - 1 };
    } else {
      // Like
      await this.prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });
      await this.prisma.comment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });
      return { liked: true, likesCount: comment.likesCount + 1 };
    }
  }
}
