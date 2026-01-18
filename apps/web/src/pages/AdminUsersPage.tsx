import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { UserPrivate, Role, PaginatedResponse, UpdateRoleInput } from '@systemink/shared';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/store';
import { getInitials } from '@/lib/utils';
import { Trash2, UserCog, Mail } from 'lucide-react';

function UserCard({ user, currentUser }: { user: UserPrivate & { postCount?: number }; currentUser: UserPrivate }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const roleMutation = useMutation({
    mutationFn: (data: UpdateRoleInput) => api.put(`/users/${user.id}/role`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Role updated!',
        description: `User role has been updated to ${user.role}.`,
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

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/users/${user.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'User deleted!',
        description: 'User has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const handleRoleChange = (newRole: Role) => {
    if (!confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    roleMutation.mutate({ role: newRole });
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;
    deleteMutation.mutate();
  };

  const roleColors: Record<Role, string> = {
    ADMIN: 'bg-red-500',
    EDITOR: 'bg-blue-500',
    AUTHOR: 'bg-green-500',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1">{user.name}</h3>
              <p className="text-sm text-muted-foreground mb-1">@{user.username}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                <Mail className="h-3 w-3" />
                <span className="truncate">{user.email}</span>
              </div>
              <Badge className={roleColors[user.role]}>{user.role}</Badge>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {user.postCount || 0} {user.postCount === 1 ? 'post' : 'posts'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              disabled={user.id === currentUser.id || roleMutation.isPending}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value={Role.AUTHOR}>AUTHOR</option>
              <option value={Role.EDITOR}>EDITOR</option>
              <option value={Role.ADMIN}>ADMIN</option>
            </select>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={user.id === currentUser.id || deleteMutation.isPending}
            title={user.id === currentUser.id ? 'Cannot delete yourself' : 'Delete user'}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {user.id === currentUser.id && (
          <p className="text-xs text-muted-foreground mt-2">You cannot change your own role or delete yourself</p>
        )}
      </CardContent>
    </Card>
  );
}

function UserSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => api.get<PaginatedResponse<UserPrivate & { postCount?: number }>>(`/users?page=${page}&limit=20`),
    enabled: !!currentUser && currentUser.role === Role.ADMIN,
  });

  if (!currentUser || currentUser.role !== Role.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">User Management</h1>
        <div className="flex items-center space-x-2">
          <UserCog className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Admin Panel</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <UserSkeleton key={i} />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="space-y-4 mb-8">
            {data.data.map((user) => (
              <UserCard key={user.id} user={user} currentUser={currentUser} />
            ))}
          </div>
          {data.meta.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No users found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
