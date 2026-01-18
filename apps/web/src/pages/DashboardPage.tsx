import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { PostListItem, PostStatus, PaginatedResponse } from '@systemink/shared';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Plus, Edit, Eye, Trash2, Calendar, Clock, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function PostCard({ post }: { post: PostListItem }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handlePublish = async () => {
    try {
      await api.post(`/posts/${post.id}/publish`);
      // Invalidate all dashboard queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['posts', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.slug] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({ title: 'Post published!', description: 'Your post is now live.' });
    } catch (error: any) {
      toast({
        title: 'Failed to publish',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const handleUnpublish = async () => {
    try {
      await api.post(`/posts/${post.id}/unpublish`);
      // Invalidate all dashboard queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['posts', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.slug] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({ title: 'Post unpublished!', description: 'Your post is now a draft.' });
    } catch (error: any) {
      toast({
        title: 'Failed to unpublish',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      // Invalidate all dashboard queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['posts', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.slug] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({ title: 'Post deleted!', description: 'Your post has been deleted.' });
    } catch (error: any) {
      toast({
        title: 'Failed to delete',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const statusColors: Record<PostStatus, string> = {
    DRAFT: 'status-draft',
    SCHEDULED: 'status-scheduled',
    PUBLISHED: 'status-published',
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link to={`/editor/${post.id}`}>
              <CardTitle className="mb-2 hover:opacity-70 transition-opacity cursor-pointer">
                {post.title}
              </CardTitle>
            </Link>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-3">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{post.readingTime} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{post.viewsCount} views</span>
              </div>
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            <Badge className={statusColors[post.status]}>{post.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Link to={`/post/${post.slug}`}>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </Link>
          <Link to={`/editor/${post.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          {post.status === 'PUBLISHED' ? (
            <Button variant="outline" size="sm" onClick={handleUnpublish}>
              Unpublish
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handlePublish}>
              Publish
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PostSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <Skeleton className="h-5 w-16" />
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as PostStatus) || undefined;
  const tag = searchParams.get('tag') || undefined;
  const pageParam = searchParams.get('page');
  
  // Parse page from URL, default to 1
  const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
  const page = isNaN(pageFromUrl) ? 1 : pageFromUrl;

  // Build query string properly
  const queryParams = new URLSearchParams();
  if (status) queryParams.set('status', status);
  if (tag) queryParams.set('tag', tag);
  queryParams.set('page', page.toString());
  queryParams.set('limit', '10');
  const queryString = queryParams.toString();

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', 'my', status, tag, page],
    queryFn: () =>
      api.get<PaginatedResponse<PostListItem>>(`/posts/my${queryString ? `?${queryString}` : ''}`),
    retry: 1,
  });

  const handleStatusChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', value);
    }
    newParams.delete('page'); // Reset to page 1
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', newPage.toString());
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <Link to="/editor/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex items-center">
          <Filter className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            value={status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-48 h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">All Status</option>
            <option value={PostStatus.DRAFT}>Draft</option>
            <option value={PostStatus.SCHEDULED}>Scheduled</option>
            <option value={PostStatus.PUBLISHED}>Published</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="space-y-4 mb-8">
            {data.data.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {data.meta.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(Math.min(data.meta.totalPages, page + 1))}
                disabled={page === data.meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : error ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-destructive mb-4">
              {(error as any)?.message || 'Failed to load posts. Please try again.'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No posts found.</p>
            <Link to="/editor/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Post
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
