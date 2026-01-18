import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { UserPublic, PaginatedResponse } from '@systemink/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { Users } from 'lucide-react';

function AuthorCard({ author, page }: { author: UserPublic; page: number }) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => api.post<{ following: boolean; followersCount: number; message?: string }>(`/users/${author.username}/follow`),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['authors'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<PaginatedResponse<UserPublic>>(['authors', page, user?.id]);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<UserPublic>>(['authors', page, user?.id], {
          ...previousData,
          data: previousData.data.map((u) =>
            u.id === author.id
              ? {
                  ...u,
                  isFollowing: !u.isFollowing,
                  followersCount: (u.isFollowing
                    ? (u.followersCount || 0) - 1
                    : (u.followersCount || 0) + 1),
                }
              : u
          ),
        });
      }

      return { previousData };
    },
    onSuccess: (response) => {
      // Force update with server response - ensure exact match with server state
      queryClient.setQueryData<PaginatedResponse<UserPublic>>(['authors', page, user?.id], (old: PaginatedResponse<UserPublic> | undefined) => {
        if (!old) return old;
        // Create a new object to ensure React detects the change
        const updatedData = old.data.map((u) =>
          u.id === author.id
            ? {
                ...u,
                isFollowing: response.following !== undefined ? response.following : u.isFollowing,
                followersCount: response.followersCount !== undefined ? response.followersCount : u.followersCount,
              }
            : u
        );
        return {
          ...old,
          data: updatedData,
        };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['author', author.username] });
      queryClient.invalidateQueries({ queryKey: ['authors'], exact: false });
      
      toast({
        title: response.following ? 'Following!' : 'Unfollowed',
        description: response.message || (response.following ? `You're now following ${author.name}` : `You've unfollowed ${author.name}`),
      });
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['authors', page, user?.id], context.previousData);
      }
      toast({
        title: 'Failed to follow',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    followMutation.mutate();
  };

  return (
    <Link to={`/author/${author.username}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Link to={`/author/${author.username}`}>
              <Avatar className="h-16 w-16">
                <AvatarImage src={author.avatarUrl || undefined} />
                <AvatarFallback className="text-sm font-medium">{getInitials(author.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <Link to={`/author/${author.username}`}>
                    <h3 className="text-xl font-semibold mb-1 hover:opacity-70 transition-opacity">{author.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">@{author.username}</p>
                </div>
                {user && user.id !== author.id && (
                  <Button
                    onClick={handleFollowClick}
                    disabled={followMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 rounded-full border border-foreground text-foreground hover:bg-muted bg-transparent"
                  >
                    {followMutation.isPending ? (
                      <>...</>
                    ) : author.isFollowing ? (
                      <>Unfollow</>
                    ) : (
                      <>Follow</>
                    )}
                  </Button>
                )}
              </div>
              {author.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{author.bio}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{author.followersCount || 0} followers</span>
                </div>
                <span>·</span>
                <span>{author.postCount || 0} {author.postCount === 1 ? 'post' : 'posts'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AuthorSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuthorsPage() {
  const [page, setPage] = useState(1);

  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['authors', page, user?.id],
    queryFn: () => api.get<PaginatedResponse<UserPublic>>(`/users/authors?page=${page}&limit=20`),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">All Authors</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <AuthorSkeleton key={i} />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.data.map((author) => (
              <AuthorCard key={author.id} author={author} page={page} />
            ))}
          </div>
          {data.meta.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {data.meta.totalPages}
              </span>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">No authors found.</p>
      )}
    </div>
  );
}
