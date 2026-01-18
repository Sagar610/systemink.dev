import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { TagPublic } from '@systemink/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function TagCard({ tag }: { tag: TagPublic }) {
  return (
    <Link to={`/tag/${tag.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <Badge variant="secondary" className="text-lg mb-2">
            {tag.name}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            {tag.postCount || 0} {tag.postCount === 1 ? 'post' : 'posts'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function TagSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-16" />
      </CardContent>
    </Card>
  );
}

export default function TagsPage() {
  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get<TagPublic[]>('/tags'),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">All Tags</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <TagSkeleton key={i} />
          ))}
        </div>
      ) : tags && tags.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No tags found.</p>
      )}
    </div>
  );
}
