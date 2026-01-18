import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { api } from '@/lib/api';
import { PostListItem, PaginatedResponse } from '@systemink/shared';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getInitials } from '@/lib/utils';
import { Search, Clock, Eye, Calendar } from 'lucide-react';

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
            className="flex items-center space-x-1 hover:text-primary"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.avatarUrl || undefined} />
              <AvatarFallback className="text-[10px] font-medium">{getInitials(post.author.name)}</AvatarFallback>
            </Avatar>
            <span>{post.author.name}</span>
          </Link>
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

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const { data, isLoading } = useQuery({
    queryKey: ['search', query, page],
    queryFn: () => api.get<PaginatedResponse<PostListItem>>(`/posts/search?q=${encodeURIComponent(query)}&page=${page}&limit=10`),
    enabled: query.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ q: query, page: '1' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">Search</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={!query.trim()}>
            Search
          </Button>
        </div>
      </form>

      {query && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Found {data.meta.total} {data.meta.total === 1 ? 'result' : 'results'} for "{query}"
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.data.map((post) => (
                  <PostCard key={post.id} post={post} />
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
            <p className="text-muted-foreground">No results found for "{query}".</p>
          )}
        </>
      )}
    </div>
  );
}
