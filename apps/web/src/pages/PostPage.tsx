import { useQuery } from '@tanstack/react-query';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { PostPublic, PostListItem } from '@systemink/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, getInitials } from '@/lib/utils';
import { Clock, Eye, Calendar, Lock, LogIn } from 'lucide-react';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import TableOfContents from '@/components/TableOfContents';
import CommentsSection from '@/components/CommentsSection';
import { useAuthStore } from '@/lib/store';

function PostSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Skeleton className="h-12 w-3/4 mb-4" />
      <div className="flex items-center space-x-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-64 w-full mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function RelatedPostCard({ post }: { post: PostListItem }) {
  return (
    <Card className="overflow-hidden card-hover">
      {post.coverImageUrl && (
        <Link to={`/post/${post.slug}`}>
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-32 object-cover"
            loading="lazy"
          />
        </Link>
      )}
      <CardContent className="p-4">
        <Link to={`/post/${post.slug}`}>
          <h3 className="font-semibold mb-2 hover:opacity-70 transition-opacity line-clamp-2">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.excerpt}</p>
        )}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{post.readingTime} min read</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const isLoggedIn = !!user;

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => api.get<PostPublic>(`/posts/slug/${slug}`),
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ['post', slug, 'related'],
    queryFn: () => api.get<PostListItem[]>(`/posts/slug/${slug}/related?limit=4`),
    enabled: !!slug && !!post && isLoggedIn, // Only fetch related if user is logged in
  });

  useEffect(() => {
    if (!post || !isLoggedIn) return;

    // Track view only if logged in
    api.post(`/posts/${post.id}/view`).catch(() => {
      // Ignore errors
    });

    // Add copy buttons to code blocks
    const codeBlocks = contentRef.current?.querySelectorAll('pre code');
    codeBlocks?.forEach((codeBlock) => {
      const pre = codeBlock.parentElement;
      if (pre && !pre.querySelector('[data-copy-button]')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative group';
        pre.parentElement?.replaceChild(wrapper, pre);
        wrapper.appendChild(pre);

        const button = document.createElement('div');
        button.setAttribute('data-copy-button', 'true');
        button.className = 'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity';
        const copyButton = document.createElement('button');
        copyButton.className = 'bg-muted hover:bg-muted/80 rounded p-1.5 text-xs';
        copyButton.textContent = 'Copy';
        copyButton.onclick = async () => {
          const text = codeBlock.textContent || '';
          try {
            await navigator.clipboard.writeText(text);
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
              copyButton.textContent = 'Copy';
            }, 2000);
          } catch {}
        };
        button.appendChild(copyButton);
        wrapper.appendChild(button);
      }
    });
  }, [post, isLoggedIn]);

  if (isLoading) {
    return (
      <>
        <ReadingProgressBar />
        <PostSkeleton />
      </>
    );
  }

  if (!post) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {isLoggedIn && <ReadingProgressBar />}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-8 items-start">
          {/* Table of Contents - Desktop Left Side (only show when logged in) */}
          {isLoggedIn && (
            <aside 
              className="hidden lg:block w-64 flex-shrink-0"
              style={{ 
                position: 'sticky',
                top: '6rem',
                alignSelf: 'flex-start',
                height: 'fit-content',
                maxHeight: 'calc(100vh - 8rem)'
              }}
            >
              <TableOfContents html={post.contentHtml} />
            </aside>
          )}

          {/* Main Content */}
          <article className="flex-1 max-w-4xl">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
              {post.excerpt && (
                <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <Link
                  to={`/author/${post.author.username}`}
                  className="flex items-center space-x-2 hover:text-primary transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author.avatarUrl || undefined} />
                    <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                  </Avatar>
                  <span>{post.author.name}</span>
                </Link>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewsCount} views</span>
                </div>
              </div>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <Link key={tag.id} to={`/tag/${tag.slug}`}>
                      <Badge variant="secondary" className="hover:opacity-70 transition-opacity">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {/* Cover Image */}
            {post.coverImageUrl && (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
                loading="lazy"
              />
            )}

            {/* Login Prompt or Content */}
            {!isLoggedIn ? (
              <Card className="mb-12 border-border bg-muted">
                <CardContent className="p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6 flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border border-border">
                        <Lock className="h-8 w-8 text-foreground" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Login to read this post</h2>
                    <p className="text-muted-foreground mb-6">
                      Join our community to access full blog posts, leave comments, and engage with other readers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link to="/login">
                        <Button size="lg" className="w-full sm:w-auto gap-2">
                          <LogIn className="h-4 w-4" />
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Content - Only shown when logged in */}
                <div
                  ref={contentRef}
                  data-post-content
                  className="prose prose-lg dark:prose-invert max-w-none mb-12"
                  dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                />

                {/* Author Info */}
                <Card className="mb-12">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={post.author.avatarUrl || undefined} />
                        <AvatarFallback className="text-sm font-medium">{getInitials(post.author.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link to={`/author/${post.author.username}`}>
                          <h3 className="text-xl font-semibold mb-1 hover:opacity-70 transition-opacity">
                            {post.author.name}
                          </h3>
                        </Link>
                        {post.author.bio && (
                          <p className="text-muted-foreground mb-3">{post.author.bio}</p>
                        )}
                        <div className="flex space-x-3">
                          {Object.entries(post.author.links || {}).map(([key, url]) => (
                            <a
                              key={key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-foreground hover:underline"
                            >
                              {key}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments Section - Only shown when logged in */}
                <CommentsSection postId={post.id} postAuthorId={post.author.id} />

                {/* Related Posts */}
                {related && related.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {related.map((relatedPost) => (
                        <RelatedPostCard key={relatedPost.id} post={relatedPost} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
