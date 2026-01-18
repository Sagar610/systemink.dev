import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { TagPublic, PostListItem, PaginatedResponse } from '@systemink/shared';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getInitials } from '@/lib/utils';
import { Clock, Eye, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

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
          <Link
            to={`/author/${post.author.username}`}
            className="flex items-center space-x-1 hover:opacity-70 transition-opacity"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.avatarUrl || undefined} />
              <AvatarFallback className="text-[10px] font-medium">{getInitials(post.author.name)}</AvatarFallback>
            </Avatar>
            <span>{post.author.name}</span>
          </Link>
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
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

export default function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: tag, isLoading: tagLoading } = useQuery({
    queryKey: ['tag', slug],
    queryFn: () => api.get<TagPublic>(`/tags/${slug}`),
    enabled: !!slug,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'tag', slug, page],
    queryFn: () => api.get<PaginatedResponse<PostListItem>>(`/posts?tag=${slug}&page=${page}&limit=10`),
    enabled: !!slug,
  });

  if (tagLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <p className="text-muted-foreground">Tag not found.</p>
        <Link to="/tags">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tags
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link to="/tags">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Tags
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">{tag.name}</h1>
        <p className="text-muted-foreground">
          {tag.postCount || 0} {tag.postCount === 1 ? 'post' : 'posts'}
        </p>
      </div>

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
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {posts.meta.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(posts.meta.totalPages, p + 1))}
                disabled={page === posts.meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">No posts found for this tag.</p>
      )}
    </div>
  );
}
