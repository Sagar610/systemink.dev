import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TurndownService from 'turndown';
import { api } from '@/lib/api';
import { PostDraft, CreatePostInput, UpdatePostInput, PostStatus, TagPublic } from '@systemink/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Save, Send, Eye, X } from 'lucide-react';
import { z } from 'zod';
import RichTextEditor from '@/components/RichTextEditor';

// Simplified schema - slug is optional (auto-generated)
const editorSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  excerpt: z.string().max(500).optional(),
  contentHtml: z.string().min(1, 'Content is required'),
  status: z.nativeEnum(PostStatus).optional(),
  scheduledAt: z.string().optional().nullable(),
});

type EditorFormData = z.infer<typeof editorSchema>;

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = id === 'new';
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutosaveRef = useRef<boolean>(false);
  const [preview, setPreview] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [contentHtml, setContentHtml] = useState('');

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get<PostDraft>(`/posts/${id}`),
    enabled: !isNew && !!id,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get<TagPublic[]>('/tags'),
  });

  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<EditorFormData>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      contentHtml: '',
      status: PostStatus.DRAFT,
      scheduledAt: null,
    },
  });

  const title = watch('title');
  const excerpt = watch('excerpt');
  const status = watch('status') || PostStatus.DRAFT;

  // Load post data if editing
  useEffect(() => {
    if (post) {
      setValue('title', post.title);
      setValue('excerpt', post.excerpt || '');
      // Convert markdown to HTML for editing (if post has markdown)
      if (post.contentMd) {
        // For editing, we need to convert markdown to HTML
        // Since backend stores markdown, we'll use contentHtml if available
        setContentHtml(post.contentHtml || post.contentMd);
      } else {
        setContentHtml(post.contentHtml || '');
      }
      setValue('contentHtml', post.contentHtml || '');
      setSelectedTags(post.tags.map((t) => t.id));
      setCoverImageUrl(post.coverImageUrl);
    }
  }, [post, setValue]);

  // Sync contentHtml from editor
  useEffect(() => {
    setValue('contentHtml', contentHtml, { shouldDirty: true });
  }, [contentHtml, setValue]);

  const saveMutation = useMutation({
    mutationFn: async (data: CreatePostInput | UpdatePostInput): Promise<{ id: string; slug: string; isNew: boolean }> => {
      if (!title || !contentHtml) {
        throw new Error('Title and content are required');
      }
      
      const contentMd = turndownService.turndown(contentHtml);
      const postData = {
        ...data,
        contentMd,
        // Don't send slug - backend will auto-generate
      };
      
      // Check if we have a valid post ID (not 'new')
      const currentId = id && id !== 'new' ? id : null;
      
      if (!currentId) {
        // Create new post
        const response = await api.post<{ id: string; slug: string }>('/posts', { ...postData, status: PostStatus.DRAFT });
        return { ...response, isNew: true };
      } else {
        // Update existing post
        const response = await api.put<{ id: string; slug: string }>(`/posts/${currentId}`, postData);
        return { ...response, isNew: false };
      }
    },
    onSuccess: (response, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // If it was a new post, navigate to the editor with the new ID
      if (response.isNew && response.id) {
        queryClient.invalidateQueries({ queryKey: ['post', response.id] });
        navigate(`/editor/${response.id}`, { replace: true });
        toast({
          title: 'Saved!',
          description: 'Your post has been saved.',
        });
      } else {
        // Existing post updated
        queryClient.invalidateQueries({ queryKey: ['post', id] });
        queryClient.refetchQueries({ queryKey: ['post', id] });
        // Only show toast if this is NOT an autosave (check if it's from autosave flag)
        // Autosaves won't show notifications to avoid spam
        const isAutosave = (context as any)?.isAutosave;
        if (!isAutosave) {
          toast({
            title: 'Saved!',
            description: 'Your post has been saved.',
          });
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Save failed',
        description: error.message || error.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (): Promise<{ id: string; slug: string; isNew: boolean }> => {
      if (!title || !contentHtml) {
        throw new Error('Title and content are required');
      }
      
      const contentMd = turndownService.turndown(contentHtml);
      const postData = {
        title,
        excerpt: excerpt || undefined,
        contentMd,
        tagIds: selectedTags,
        coverImageUrl: coverImageUrl || undefined,
        status: PostStatus.PUBLISHED,
      };
      
      // Check if we have a valid post ID (not 'new')
      const currentId = id && id !== 'new' ? id : null;
      
      // If it's a new post, create it with PUBLISHED status
      if (!currentId) {
        const response = await api.post<{ id: string; slug: string }>('/posts', postData);
        return { ...response, isNew: true };
      }
      
      // For existing posts, first ensure it's saved, then publish
      // First update the post to ensure it exists with latest content
      await api.put(`/posts/${currentId}`, {
        ...postData,
        status: PostStatus.DRAFT, // Save as draft first
      });
      
      // Then publish it
      const response = await api.post<{ id: string; slug: string }>(`/posts/${currentId}/publish`);
      return { ...response, isNew: false };
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // If it was a new post, navigate to the editor first, then to published post
      if (response.isNew && response.id) {
        queryClient.invalidateQueries({ queryKey: ['post', response.id] });
        const slug = response.slug;
        if (slug) {
          navigate(`/post/${slug}`);
        } else {
          navigate(`/editor/${response.id}`);
        }
      } else {
        // Existing post published
        queryClient.invalidateQueries({ queryKey: ['post', id] });
        const slug = response.slug;
        if (slug) {
          navigate(`/post/${slug}`);
        } else {
          // If no slug, try to get it from the response
          navigate('/dashboard');
        }
      }
      
      toast({
        title: 'Published!',
        description: 'Your post is now live.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Publish failed',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  // Autosave draft - only for existing posts
  useEffect(() => {
    // Don't autosave if it's a new post (no ID yet) or if post hasn't loaded
    const currentId = id && id !== 'new' ? id : null;
    if (!currentId || !post || !isDirty || !title || !contentHtml) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      const contentMd = turndownService.turndown(contentHtml);
      // Mark as autosave before mutating
      isAutosaveRef.current = true;
      saveMutation.mutate({
        title,
        excerpt: excerpt || undefined,
        contentMd,
        tagIds: selectedTags,
        coverImageUrl: coverImageUrl || undefined,
        status: PostStatus.DRAFT,
      } as UpdatePostInput);
    }, 3000);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, excerpt, contentHtml, selectedTags, coverImageUrl, isDirty, post, id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      const response = await api.post<{ url: string }>('/uploads?type=cover', formData);
      setCoverImageUrl(response.url);
      toast({
        title: 'Image uploaded!',
        description: 'Cover image has been uploaded.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleSave = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!title || !contentHtml) {
      toast({
        title: 'Validation failed',
        description: 'Please fill in title and content.',
        variant: 'destructive',
      });
      return;
    }
    
    const contentMd = turndownService.turndown(contentHtml);
    saveMutation.mutate({
      title,
      excerpt: excerpt || undefined,
      contentMd,
      tagIds: selectedTags,
      coverImageUrl: coverImageUrl || undefined,
      status: PostStatus.DRAFT,
    } as CreatePostInput | UpdatePostInput);
  };

  const handlePublish = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!title || !contentHtml) {
      toast({
        title: 'Validation failed',
        description: 'Please fill in title and content.',
        variant: 'destructive',
      });
      return;
    }
    try {
      publishMutation.mutate();
    } catch (error: any) {
      toast({
        title: 'Publish failed',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handlePublish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, contentHtml, selectedTags, coverImageUrl]);

  if (isLoading && !isNew) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[calc(100vh-12rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-16 max-w-7xl min-h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{isNew ? 'New Post' : 'Edit Post'}</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="mr-2 h-4 w-4" />
            {preview ? 'Edit' : 'Preview'}
          </Button>
          <Button type="button" variant="outline" onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button type="button" onClick={handlePublish} disabled={publishMutation.isPending}>
            <Send className="mr-2 h-4 w-4" />
            {publishMutation.isPending ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <Input
                placeholder="Post Title"
                {...register('title')}
                className="text-2xl font-bold border-0 focus-visible:ring-0"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Label>Brief Description (Optional)</Label>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="A short description of your post..."
                {...register('excerpt')}
                rows={2}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Label>Cover Image (Optional)</Label>
            </CardHeader>
            <CardContent>
              {coverImageUrl && (
                <div className="relative mb-4">
                  <img src={coverImageUrl} alt="Cover" className="w-full h-48 object-cover rounded" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setCoverImageUrl(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
            </CardContent>
          </Card>

          <Card className="min-h-[600px]">
            <Tabs value={preview ? 'preview' : 'edit'} onValueChange={(v) => setPreview(v === 'preview')}>
              <TabsList>
                <TabsTrigger value="edit">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="h-[calc(600px-3rem)] mt-0">
                <div className="h-full">
                  <RichTextEditor
                    value={contentHtml}
                    onChange={(html) => setContentHtml(html)}
                    placeholder="Start writing your post here..."
                  />
                </div>
              </TabsContent>
              <TabsContent value="preview" className="h-[calc(600px-3rem)] mt-0 overflow-auto">
                <div
                  className="prose prose-lg dark:prose-invert max-w-none p-6"
                  dangerouslySetInnerHTML={{ __html: contentHtml || '<p class="text-muted-foreground">Start writing to see preview...</p>' }}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <select
                  {...register('status')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value={PostStatus.DRAFT}>Draft</option>
                  <option value={PostStatus.SCHEDULED}>Scheduled</option>
                  <option value={PostStatus.PUBLISHED}>Published</option>
                </select>
              </div>

              {status === PostStatus.SCHEDULED && (
                <div>
                  <Label>Scheduled At</Label>
                  <Input
                    type="datetime-local"
                    {...register('scheduledAt')}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="pt-4 border-t">
                <Button type="button" className="w-full" onClick={handlePublish} disabled={publishMutation.isPending}>
                  <Send className="mr-2 h-4 w-4" />
                  {publishMutation.isPending ? 'Publishing...' : 'Publish Now'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              {tags && tags.length === 0 && (
                <p className="text-sm text-muted-foreground">No tags available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Save Draft</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">Ctrl/Cmd+S</code>
              </div>
              <div className="flex items-center justify-between">
                <span>Publish</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">Ctrl/Cmd+Enter</code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
