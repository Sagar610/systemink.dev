import {
  PaginatedResponse,
  PostListItem,
  PostPublic,
  TagPublic,
  UserPublic,
} from '@systemink/shared';
import {
  AUTHOR,
  BLOG_LIST,
  BLOG_POSTS,
  FEATURED_SLUGS,
  tagsWithCounts,
} from '@/data/blog-posts';

function paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;
  const start = (safePage - 1) * safeLimit;
  const data = items.slice(start, start + safeLimit);
  return {
    data,
    meta: {
      total: items.length,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(items.length / safeLimit)),
    },
  };
}

function parseUrl(endpoint: string): { path: string; params: URLSearchParams } {
  const url = new URL(endpoint, 'https://systemink.local');
  return { path: url.pathname, params: url.searchParams };
}

function byRecency(posts: PostListItem[]): PostListItem[] {
  return [...posts].sort(
    (a, b) => +new Date(b.publishedAt || b.createdAt) - +new Date(a.publishedAt || a.createdAt),
  );
}

function byViews(posts: PostListItem[]): PostListItem[] {
  return [...posts].sort((a, b) => b.viewsCount - a.viewsCount);
}

function matchesQuery(post: PostListItem, query: string): boolean {
  const haystack = [
    post.title,
    post.excerpt || '',
    post.author.name,
    ...post.tags.map((tag) => tag.name),
  ]
    .join(' ')
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function emptyComments() {
  return {
    data: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
}

export function resolveStatic(endpoint: string, method = 'GET'): unknown | undefined {
  const verb = method.toUpperCase();
  const { path, params } = parseUrl(endpoint);
  const page = parseInt(params.get('page') || '1', 10);
  const limit = parseInt(params.get('limit') || '10', 10);

  if (verb === 'POST' && /^\/posts\/[^/]+\/view$/.test(path)) {
    return { counted: true };
  }

  if (verb === 'GET' && /^\/posts\/[^/]+\/comments$/.test(path)) {
    return emptyComments();
  }

  if (verb !== 'GET') {
    return undefined;
  }

  if (path === '/posts/featured') {
    const featured = BLOG_LIST.filter((post) => FEATURED_SLUGS.includes(post.slug));
    return featured.slice(0, limit || 6);
  }

  if (path === '/posts/trending') {
    return byViews(BLOG_LIST).slice(0, limit || 6);
  }

  if (path === '/posts/search') {
    const query = (params.get('q') || '').trim();
    const matched = query ? BLOG_LIST.filter((post) => matchesQuery(post, query)) : byRecency(BLOG_LIST);
    return paginate(matched, page, limit);
  }

  const relatedMatch = path.match(/^\/posts\/slug\/([^/]+)\/related$/);
  if (relatedMatch) {
    const current = BLOG_POSTS.find((post) => post.slug === relatedMatch[1]);
    if (!current) return [];
    const tagSet = new Set(current.tags.map((item) => item.slug));
    return BLOG_LIST.filter((post) => {
      if (post.slug === current.slug) return false;
      return post.tags.some((item) => tagSet.has(item.slug));
    }).slice(0, limit || 4);
  }

  const slugMatch = path.match(/^\/posts\/slug\/([^/]+)$/);
  if (slugMatch) {
    return BLOG_POSTS.find((post) => post.slug === slugMatch[1]);
  }

  const authorPosts = path.match(/^\/posts\/author\/([^/]+)$/);
  if (authorPosts) {
    const username = authorPosts[1];
    const posts = BLOG_LIST.filter((post) => post.author.username === username);
    return paginate(byRecency(posts), page, limit);
  }

  if (path === '/posts') {
    const tagSlug = params.get('tag');
    const posts = tagSlug
      ? BLOG_LIST.filter((post) => post.tags.some((item) => item.slug === tagSlug))
      : BLOG_LIST;
    return paginate(byRecency(posts), page, limit);
  }

  if (path === '/tags') {
    return tagsWithCounts();
  }

  const tagMatch = path.match(/^\/tags\/([^/]+)$/);
  if (tagMatch) {
    return tagsWithCounts().find((item: TagPublic) => item.slug === tagMatch[1]);
  }

  if (path === '/users/authors') {
    const author: UserPublic = { ...AUTHOR, postCount: BLOG_POSTS.length };
    return paginate([author], page, limit || 20);
  }

  const userMatch = path.match(/^\/users\/([^/]+)$/);
  if (userMatch && userMatch[1] !== 'authors') {
    if (userMatch[1] === AUTHOR.username) {
      return { ...AUTHOR, postCount: BLOG_POSTS.length };
    }
    return undefined;
  }

  return undefined;
}

export type { PostListItem, PostPublic };
