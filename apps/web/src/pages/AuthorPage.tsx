import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { UserPublic, PostListItem, PaginatedResponse } from '@systemink/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getInitials } from '@/lib/utils';
import { Clock, Eye, ArrowLeft, ExternalLink, Calendar, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';

function PostCard({ post }: { post: PostListItem }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {post.coverImageUrl && (
        <Link to={`/post/${post.slug}`}>
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </Link>
      )}
      <CardHeader>
        <Link to={`/post/${post.slug}`}>
          <CardTitle className="mb-2 hover:opacity-70 transition-opacity">
            {post.title}
          </CardTitle>
        </Link>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
        )}
        <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{post.readingTime} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{post.viewsCount}</span>
          </div>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag.id} to={`/tag/${tag.slug}`}>
                <Badge variant="secondary" className="hover:opacity-70 transition-opacity">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}

function PostSkeleton() {
  return (
    <Card>
      <Skeleton className="w-full h-48" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
    </Card>
  );
}

export default function AuthorPage() {
  const { username } = useParams<{ username: string }>();
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: author, isLoading: authorLoading } = useQuery({
    queryKey: ['author', username],
    queryFn: () => api.get<UserPublic>(`/users/${username}`),
    enabled: !!username,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'author', username, page],
    queryFn: () => api.get<PaginatedResponse<PostListItem>>(`/posts/author/${username}?page=${page}&limit=10`),
    enabled: !!username,
  });

  const followMutation = useMutation({
    mutationFn: () => api.post<{ following: boolean; followersCount: number; message?: string }>(`/users/${username}/follow`),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['author', username] });

      // Snapshot previous value
      const previousAuthor = queryClient.getQueryData<UserPublic>(['author', username]);

      // Optimistically update to the new value
      if (previousAuthor) {
        queryClient.setQueryData<UserPublic>(['author', username], {
          ...previousAuthor,
          isFollowing: !previousAuthor.isFollowing,
          followersCount: (previousAuthor.isFollowing
            ? (previousAuthor.followersCount || 0) - 1
            : (previousAuthor.followersCount || 0) + 1),
        });
      }

      return { previousAuthor };
    },
    onSuccess: (response) => {
      // Force update with server response - this ensures the button state matches the server exactly
      // The optimistic update already shows the new state, this just ensures it's correct
      queryClient.setQueryData<UserPublic>(['author', username], (old: UserPublic | undefined) => {
        if (!old) return old;
        // Update with exact server response - this will trigger a re-render
        return {
          ...old,
          isFollowing: response.following !== undefined ? response.following : old.isFollowing,
          followersCount: response.followersCount !== undefined ? response.followersCount : old.followersCount,
        };
      });
      
      // Mark authors list as stale (will refetch when needed, not immediately)
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      
      toast({
        title: response.following ? 'Following!' : 'Unfollowed',
        description: response.message || (response.following ? `You're now following ${author?.name}` : `You've unfollowed ${author?.name}`),
      });
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousAuthor) {
        queryClient.setQueryData(['author', username], context.previousAuthor);
      }
      toast({
        title: 'Failed to follow',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  if (authorLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-32 w-full mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <p className="text-muted-foreground">Author not found.</p>
        <Link to="/authors">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Authors
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link to="/authors">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Authors
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={author.avatarUrl || undefined} />
                <AvatarFallback className="text-xl font-medium">{getInitials(author.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{author.name}</h1>
                  <p className="text-muted-foreground mb-2">@{author.username}</p>
                </div>
                {user && user.id !== author.id && (
                  <Button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 rounded-full border border-foreground text-foreground hover:bg-muted bg-transparent gap-1.5"
                  >
                    {followMutation.isPending ? (
                      <>Loading...</>
                    ) : author.isFollowing ? (
                      <>Unfollow</>
                    ) : (
                      <>Follow</>
                    )}
                  </Button>
                )}
              </div>
              {author.bio && <p className="text-muted-foreground mb-4">{author.bio}</p>}
              <div className="flex items-center space-x-6 mb-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{author.followersCount || 0}</span>
                  <span className="text-muted-foreground">followers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{author.followingCount || 0}</span>
                  <span className="text-muted-foreground">following</span>
                </div>
                <div>
                  <span className="font-medium">{author.postCount || 0}</span>
                  <span className="text-muted-foreground"> {author.postCount === 1 ? 'post' : 'posts'}</span>
                </div>
              </div>
              {author.links && Object.keys(author.links).length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {Object.entries(author.links).map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground hover:underline inline-flex items-center space-x-1"
                    >
                      <span>{key}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-6">Posts</h2>

      {postsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : posts && posts.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.data.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {posts.meta.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {posts.meta.totalPages}
              </span>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(posts.meta.totalPages, p + 1))} disabled={page === posts.meta.totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">No posts found.</p>
      )}
    </div>
  );
}
