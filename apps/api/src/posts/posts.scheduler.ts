import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostsService } from './posts.service';

@Injectable()
export class PostsScheduler {
  constructor(private postsService: PostsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduled() {
    const count = await this.postsService.publishScheduled();
    if (count > 0) {
      console.log(`Published ${count} scheduled post(s)`);
    }
  }
}
