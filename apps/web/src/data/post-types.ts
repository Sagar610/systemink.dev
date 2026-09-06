export interface PostDraft {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  publishedAt: string;
  viewsCount: number;
  featured: boolean;
  tagSlugs: string[];
  authorUsername: string;
  contentHtml: string;
}
