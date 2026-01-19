import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostsService } from './posts.service';

@Injectable()
export class PostsScheduler {
  constructor(private postsService: PostsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduled() {
    try {
      const count = await this.postsService.publishScheduled();
      if (count > 0) {
        console.log(`Published ${count} scheduled post(s)`);
      }
    } catch (error: any) {
      // Silently ignore database errors (tables might not exist yet)
      if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
        // Table doesn't exist yet, migrations might still be running
        return;
      }
      console.error('Error in publishScheduled:', error);
    }
  }
}
