import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MarkdownService } from './markdown.service';
import { PostsScheduler } from './posts.scheduler';

@Module({
  providers: [PostsService, MarkdownService, PostsScheduler],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
