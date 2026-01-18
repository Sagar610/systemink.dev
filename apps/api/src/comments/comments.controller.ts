import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Role, CommentStatus } from '@prisma/client';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateCommentDto } from './dto';
import { PostsService } from '../posts/posts.service';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private postsService: PostsService,
  ) {}

  @Get()
  findByPostId(
    @Param('postId') postId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser('id') userId?: string,
  ) {
    return this.commentsService.findByPostId(postId, page || 1, limit || 20, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  create(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('postId') postId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    // Get post to check author
    const post = await this.postsService.findById(postId, userId, userRole);
    const postAuthorId = (post as any).author?.id || '';
    return this.commentsService.delete(id, userId, userRole, postAuthorId);
  }

  @Post(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  moderate(
    @Param('id') id: string,
    @Body('status') status: CommentStatus,
  ) {
    return this.commentsService.moderate(id, status);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  toggleLike(
    @Param('postId') postId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.toggleLike(id, userId);
  }
}
