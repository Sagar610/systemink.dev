import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, UpdateRoleDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
        links: true,
        createdAt: true,
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' },
            },
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      links: typeof user.links === 'string' ? JSON.parse(user.links) : user.links,
      postCount: user._count.posts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing,
    };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map((u: any) => ({
        ...u,
        postCount: u._count.posts,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuthors(page: number = 1, limit: number = 20, currentUserId?: string) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          posts: {
            some: { status: 'PUBLISHED' },
          },
        },
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
          avatarUrl: true,
          links: true,
          createdAt: true,
          _count: {
            select: {
              posts: {
                where: { status: 'PUBLISHED' },
              },
              followers: true,
              following: true,
            },
          },
        },
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: {
          posts: {
            some: { status: 'PUBLISHED' },
          },
        },
      }),
    ]);

    // Check follow status for each user if current user is logged in
    const usersWithFollowStatus = await Promise.all(
      users.map(async (u: any) => {
        let isFollowing = false;
        if (currentUserId && currentUserId !== u.id) {
          const follow = await this.prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: u.id,
              },
            },
          });
          isFollowing = !!follow;
        }

        return {
          ...u,
          links: typeof u.links === 'string' ? JSON.parse(u.links) : u.links,
          postCount: u._count.posts,
          followersCount: u._count.followers,
          followingCount: u._count.following,
          isFollowing,
        };
      }),
    );

    return {
      data: usersWithFollowStatus,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        links: dto.links,
      },
    });

    const { passwordHash, ...sanitized } = user;
    return {
      ...sanitized,
      links: typeof sanitized.links === 'string' ? JSON.parse(sanitized.links) : sanitized.links,
    };
  }

  async updateRole(userId: string, adminId: string, dto: UpdateRoleDto) {
    if (userId === adminId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
    });

    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async deleteUser(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new ForbiddenException('Cannot delete yourself');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const followingUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!followingUser) {
      throw new NotFoundException('User to follow not found');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    // Get current followers count
    const currentFollowersCount = await this.prisma.follow.count({
      where: { followingId },
    });

    if (existingFollow) {
      // Unfollow
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      const newCount = Math.max(0, currentFollowersCount - 1);
      return { following: false, followersCount: newCount, message: 'Unfollowed successfully' };
    } else {
      // Follow
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
      const newCount = currentFollowersCount + 1;
      return { following: true, followersCount: newCount, message: 'Followed successfully' };
    }
  }

  async toggleFollowByUsername(followerId: string, username: string) {
    const followingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!followingUser) {
      throw new NotFoundException('User not found');
    }

    return this.toggleFollow(followerId, followingUser.id);
  }
}
