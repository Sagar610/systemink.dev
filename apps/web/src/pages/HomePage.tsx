import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { PostListItem } from '@systemink/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { Clock, Eye, ArrowRight, Sparkles, TrendingUp, Hash } from 'lucide-react';

// Default tech placeholder image - used only when no images exist in the post
const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop&q=80';

// Get the best available image for a post
// Priority: 1. Cover image uploaded by writer
//           2. First image from blog content
//           3. Default tech placeholder
const getPostImageUrl = (post: PostListItem): string => {
  if (post.coverImageUrl) {
    return post.coverImageUrl;
  }
  if (post.firstContentImageUrl) {
    return post.firstContentImageUrl;
  }
  return DEFAULT_PLACEHOLDER;
};

function PostListItemMedium({ post }: { post: PostListItem }) {
  const imageUrl = getPostImageUrl(post);

  return (
    <article className="py-6 px-4 border-b border-border last:border-b-0">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <Link to={`/author/${post.author.username}`} className="flex-shrink-0">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author.avatarUrl || undefined} />
                <AvatarFallback className="text-[10px] font-medium">{getInitials(post.author.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <Link
              to={`/author/${post.author.username}`}
              className="text-sm font-medium hover:underline text-muted-foreground"
            >
              {post.author.name}
            </Link>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
          </div>

          <Link to={`/post/${post.slug}`}>
            <h2 className="text-xl md:text-2xl font-bold mb-2 hover:opacity-70 transition-opacity line-clamp-2 leading-tight">
              {post.title}
            </h2>
          </Link>

          {post.excerpt && (
            <p className="text-muted-foreground mb-3 line-clamp-2 leading-snug text-sm">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-wrap mt-4">
            {post.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <Link key={tag.id} to={`/tag/${tag.slug}`}>
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5 font-normal"
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{post.readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{post.viewsCount}</span>
            </div>
          </div>
        </div>

        {/* Fixed Size Image - Always shown */}
        <div className="flex-shrink-0 w-32 md:w-40">
          <Link to={`/post/${post.slug}`}>
            <img
              src={imageUrl}
              alt={post.title}
              className="w-32 h-24 md:w-40 md:h-28 object-cover rounded"
              loading="lazy"
              onError={(e) => {
                // Fallback to default placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                if (target.src !== DEFAULT_PLACEHOLDER) {
                  target.src = DEFAULT_PLACEHOLDER;
                }
              }}
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

function PostSkeletonMedium() {
  return (
    <article className="py-6 px-4 border-b border-border last:border-b-0">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center space-x-4 mt-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="w-32 h-24 md:w-40 md:h-28 rounded flex-shrink-0" />
      </div>
    </article>
  );
}

export default function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ['posts', 'featured'],
    queryFn: () => api.get<PostListItem[]>('/posts/featured?limit=6'),
  });

  const { data: trending } = useQuery({
    queryKey: ['posts', 'trending'],
    queryFn: () => api.get<PostListItem[]>('/posts/trending?limit=6'),
  });

  const { data: latest, isLoading: latestLoading } = useQuery({
    queryKey: ['posts', 'latest'],
    queryFn: () => api.get<{ data: PostListItem[]; meta: { totalPages: number } }>('/posts?page=1&limit=20'),
  });

  const { data: popularTags } = useQuery({
    queryKey: ['tags', 'popular'],
    queryFn: () => api.get<Array<{ id: string; name: string; slug: string; postCount: number }>>('/tags'),
  });

  const { data: sidebarTrending } = useQuery({
    queryKey: ['posts', 'trending', 'sidebar'],
    queryFn: () => api.get<PostListItem[]>('/posts/trending?limit=5'),
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content - Center */}
        <div className="lg:col-span-8">
      {/* Featured Section */}
      {featured && featured.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="h-5 w-5 text-foreground" />
            <h2 className="text-xl font-semibold">Featured</h2>
          </div>
          <div className="space-y-0 border-t border-l border-r border-border rounded-t-lg overflow-hidden">
            {featured.map((post) => (
              <PostListItemMedium key={post.id} post={post} />
            ))}
          </div>
          <div className="border-b border-l border-r border-border rounded-b-lg p-4 text-center">
            <Link to="/search?sort=featured">
              <Button variant="ghost" size="sm">
                See all featured
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Trending Section */}
      {trending && trending.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Trending on SystemInk</h2>
            <Link to="/search?sort=trending">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-0 border border-border rounded-lg overflow-hidden bg-card">
            {trending.map((post) => (
              <PostListItemMedium key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Section - Main Feed */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Latest stories</h2>
          <Link to="/search">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {latestLoading ? (
          <div className="space-y-0 border border-border rounded-lg overflow-hidden bg-card">
            {Array.from({ length: 10 }).map((_, i) => (
              <PostSkeletonMedium key={i} />
            ))}
          </div>
        ) : latest && latest.data && latest.data.length > 0 ? (
          <>
            <div className="space-y-0 border border-border rounded-lg overflow-hidden bg-card">
              {latest.data.map((post: PostListItem) => (
                <PostListItemMedium key={post.id} post={post} />
              ))}
            </div>
            {latest.meta.totalPages > 1 && (
              <div className="mt-8 text-center">
                <Link to="/search?page=2">
                  <Button variant="outline">Load More</Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="border border-border rounded-lg p-12 text-center bg-card">
            <p className="text-muted-foreground">No posts found.</p>
          </div>
        )}
      </section>
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Popular Tags */}
          {popularTags && popularTags.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Hash className="h-5 w-5 text-foreground" />
                <h3 className="font-semibold text-lg">Popular Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 20).map((tag) => (
                  <Link key={tag.id} to={`/tag/${tag.slug}`}>
                    <Badge
                      variant="secondary"
                      className="text-xs px-3 py-1.5 cursor-pointer hover:bg-secondary/80 transition-colors"
                    >
                      {tag.name}
                      <span className="ml-1.5 text-muted-foreground">({tag.postCount})</span>
                    </Badge>
                  </Link>
                ))}
              </div>
              <Link to="/tags" className="mt-4 inline-block">
                <Button variant="ghost" size="sm" className="w-full">
                  View all tags
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          )}

          {/* Trending Posts Sidebar */}
          {sidebarTrending && sidebarTrending.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-foreground" />
                <h3 className="font-semibold text-lg">Trending Now</h3>
              </div>
              <div className="space-y-4">
                {sidebarTrending.map((post, index) => (
                  <Link key={post.id} to={`/post/${post.slug}`} className="block group">
                    <div className="flex gap-3">
                      {post.coverImageUrl || post.firstContentImageUrl ? (
                        <img
                          src={post.coverImageUrl || post.firstContentImageUrl || DEFAULT_PLACEHOLDER}
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded flex-shrink-0 group-hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold line-clamp-2 group-hover:opacity-70 transition-opacity leading-tight mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{post.author.name}</span>
                          <span>·</span>
                          <span>{post.readingTime} min</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Popular Tags Skeleton */}
          {!popularTags && (
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </Card>
          )}

          {/* Trending Sidebar Skeleton */}
          {!sidebarTrending && (
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-16 h-16 rounded flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
