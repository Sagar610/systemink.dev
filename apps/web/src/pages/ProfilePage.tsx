import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { UpdateProfileInput, updateProfileSchema } from '@systemink/shared';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, X } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [links, setLinks] = useState<Record<string, string>>(user?.links || {});

  // Sync state with user data when user changes (e.g., after refresh or update)
  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatarUrl || null);
      setLinks(user.links || {});
    }
  }, [user?.avatarUrl, user?.links]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      avatarUrl: user?.avatarUrl || null,
      links: user?.links || {},
    },
  });

  const bioValue = watch('bio') || '';
  const bioMaxLength = 1000;
  const bioCount = bioValue.length;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      const response = await api.post<{ url: string }>('/uploads?type=avatar', formData);
      const newAvatarUrl = response.url;
      
      // Use the relative path directly (backend now accepts /uploads/... paths)
      setAvatarUrl(newAvatarUrl);
      
      // Auto-save avatar immediately
      const updateData = {
        name: user?.name || '',
        bio: user?.bio || null,
        avatarUrl: newAvatarUrl,
        links: links,
      };
      
      const updatedUser = await api.put<any>('/users/me', updateData);
      setUser(updatedUser as any);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['author', user?.username] });
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      
      toast({
        title: 'Avatar uploaded!',
        description: 'Your avatar has been uploaded and saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
    
    // Reset file input
    e.target.value = '';
  };

  const addLink = () => {
    const key = prompt('Enter link name (e.g., github, twitter):');
    if (!key) return;
    const url = prompt('Enter URL:');
    if (!url) return;
    setLinks((prev) => ({ ...prev, [key]: url }));
  };

  const removeLink = (key: string) => {
    setLinks((prev) => {
      const newLinks = { ...prev };
      delete newLinks[key];
      return newLinks;
    });
  };

  const mutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => api.put<any>('/users/me', data),
    onSuccess: (response) => {
      setUser(response as any);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['author', user?.username] });
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: UpdateProfileInput) => {
    mutation.mutate({
      ...data,
      avatarUrl: avatarUrl || null,
      links,
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Profile Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Upload a profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-xl font-medium">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="cursor-pointer max-w-xs"
                />
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setAvatarUrl(null)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove Avatar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                disabled={mutation.isPending}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                {...register('bio')}
                rows={4}
                disabled={mutation.isPending}
                maxLength={bioMaxLength}
              />
              <div className="flex justify-between items-center min-h-[20px]">
                <div>
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                </div>
                <p
                  className={`text-xs ${
                    bioCount > bioMaxLength * 0.9
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }`}
                >
                  {bioCount} / {bioMaxLength}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Add links to your social profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(links).map(([key, url]) => (
              <div key={key} className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={key}
                  readOnly
                  className="flex-shrink-0 w-32"
                />
                <Input
                  type="url"
                  value={url}
                  onChange={(e) =>
                    setLinks((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeLink(key)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addLink}>
              Add Link
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={mutation.isPending || !isDirty}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
