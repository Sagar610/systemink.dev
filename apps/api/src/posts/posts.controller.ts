import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto';
import { Role } from '@prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  // Public endpoints
  @Get()
  findPublished(@Query() query: PostQueryDto) {
    return this.postsService.findPublished(query);
  }

  @Get('featured')
  findFeatured(@Query('limit') limit?: number) {
    return this.postsService.findFeatured(limit || 6);
  }

  @Get('trending')
  findTrending(@Query('limit') limit?: number) {
    return this.postsService.findTrending(limit || 6);
  }

  @Get('search')
  search(
    @Query('q') q: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.search(q, page || 1, limit || 10);
  }

  @Get('author/:username')
  findByAuthor(
    @Param('username') username: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.findByAuthor(username, page || 1, limit || 10);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Get('slug/:slug/related')
  findRelated(@Param('slug') slug: string, @Query('limit') limit?: number) {
    return this.postsService.findRelated(slug, limit || 4);
  }

  // Protected endpoints
  @Get('my')
  @UseGuards(JwtAuthGuard)
  findUserPosts(@CurrentUser('id') userId: string, @Query() query: PostQueryDto) {
    return this.postsService.findUserPosts(userId, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.postsService.findById(id, userId, userRole);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, userId, userRole, dto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  publish(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.postsService.publish(id, userId, userRole);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  unpublish(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.postsService.unpublish(id, userId, userRole);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.postsService.delete(id, userId, userRole);
  }

  @Post(':id/view')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  incrementView(@Param('id') id: string, @Req() req: Request) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    return this.postsService.incrementView(id, ip as string);
  }
}
