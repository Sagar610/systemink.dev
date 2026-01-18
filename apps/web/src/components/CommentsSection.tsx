import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CommentPublic, PaginatedResponse } from '@systemink/shared';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import { MessageSquare, Trash2, Loader2, Reply, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommentsSectionProps {
  postId: string;
  canDelete?: (comment: CommentPublic, userRole: string, userId: string, postAuthorId?: string) => boolean;
  postAuthorId?: string;
}

// Helper to remove duplicate @ mentions from comment body
const removeDuplicateMentions = (body: string): string => {
  const lines = body.split('\n');
  return lines
    .map((line) => {
      // Remove duplicate @ mentions on the same line
      const words = line.split(' ');
      const seen = new Set<string>();
      return words
        .filter((word) => {
          if (word.startsWith('@')) {
            const mention = word.toLowerCase();
            if (seen.has(mention)) {
              return false; // Skip duplicate
            }
            seen.add(mention);
          }
          return true;
        })
        .join(' ');
    })
    .join('\n');
};

function CommentItem({
  comment,
  postId,
  onReply,
  onDelete,
  canDelete,
  postAuthorId,
  user,
  level = 0,
  replyingToId,
  setReplyingToId,
  onSubmitReply,
  replyText,
  setReplyText,
  isSubmittingReply,
}: {
  comment: CommentPublic;
  postId: string;
  onReply: (comment: CommentPublic) => void;
  onDelete: (commentId: string) => void;
  canDelete: (comment: CommentPublic, userRole: string, userId: string, postAuthorId?: string) => boolean;
  postAuthorId?: string;
  user: any;
  level?: number;
  replyingToId?: string | null;
  setReplyingToId?: (id: string | null) => void;
  onSubmitReply?: (parentId: string, body: string) => void;
  replyText?: string;
  setReplyText?: (text: string) => void;
  isSubmittingReply?: boolean;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showReplies, setShowReplies] = useState(level === 0); // Show top-level replies by default, hide nested by default
  const replyFormRef = useRef<HTMLDivElement>(null);

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/posts/${postId}/comments/${comment.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to like comment',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const handleReplyClick = () => {
    if (setReplyingToId) {
      setReplyingToId(comment.id);
      // Scroll to reply form after a short delay to ensure it's rendered
      setTimeout(() => {
        replyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const textarea = replyFormRef.current?.querySelector('textarea');
        textarea?.focus();
      }, 100);
    } else {
      onReply(comment);
    }
  };

  const repliesCount = comment.replies?.length || 0;
  const hasReplies = repliesCount > 0;

  // Clean comment body to remove duplicate mentions
  const cleanBody = removeDuplicateMentions(comment.body);

  const isReplying = replyingToId === comment.id;

  return (
    <div className={level > 0 ? 'border-l-2 border-primary/20 pl-4 mt-4 ml-4' : ''}>
      <div className="flex space-x-3">
        <Link to={`/author/${comment.user.username}`}>
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={comment.user.avatarUrl || undefined} />
            <AvatarFallback className="text-xs font-medium">{getInitials(comment.user.name)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <Link to={`/author/${comment.user.username}`}>
                <span className="font-semibold text-sm hover:text-primary">
                  {comment.user.name}
                </span>
              </Link>
              {comment.parent && comment.parent.user && (
                <>
                  <span className="text-muted-foreground text-xs">→</span>
                  <Link to={`/author/${comment.parent.user.username}`}>
                    <span className="text-xs text-primary hover:underline">
                      @{comment.parent.user.username}
                    </span>
                  </Link>
                </>
              )}
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            {user &&
              canDelete(comment, user.role, user.id, postAuthorId) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onDelete(comment.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
          </div>
          <p className="text-sm whitespace-pre-wrap break-words mb-2">
            {cleanBody}
          </p>
          <div className="flex items-center space-x-4 flex-wrap">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
              >
                <Heart
                  className={`h-3 w-3 mr-1 ${
                    comment.isLiked ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
                <span>{comment.likesCount || 0}</span>
              </Button>
            )}
            {!user && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                <span>{comment.likesCount || 0}</span>
              </div>
            )}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleReplyClick}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Inline Reply Form */}
          {isReplying && user && onSubmitReply && setReplyText !== undefined && (
            <div ref={replyFormRef} className="mt-4 p-3 border border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Replying to</span>
                  <Link
                    to={`/author/${comment.user.username}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    @{comment.user.username}
                  </Link>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (setReplyingToId) setReplyingToId(null);
                    if (setReplyText) setReplyText('');
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
              <Textarea
                placeholder={`Reply to @${comment.user.username}...`}
                value={replyText || ''}
                onChange={(e) => setReplyText && setReplyText(e.target.value)}
                rows={3}
                disabled={isSubmittingReply}
                className="mb-2"
              />
              <Button
                onClick={() => {
                  if (onSubmitReply && replyText && replyText.trim()) {
                    const body = replyText.trim().startsWith(`@${comment.user.username}`)
                      ? replyText.trim()
                      : `@${comment.user.username} ${replyText.trim()}`;
                    onSubmitReply(comment.id, body);
                  }
                }}
                disabled={isSubmittingReply || !replyText || !replyText.trim()}
                size="sm"
                className="h-8 px-4"
              >
                {isSubmittingReply && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Post Reply
              </Button>
            </div>
          )}

          {/* Render nested replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onReply={onReply}
                  onDelete={onDelete}
                  canDelete={canDelete}
                  postAuthorId={postAuthorId}
                  user={user}
                  level={level + 1}
                  replyingToId={replyingToId}
                  setReplyingToId={setReplyingToId}
                  onSubmitReply={onSubmitReply}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  isSubmittingReply={isSubmittingReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentsSection({
  postId,
  canDelete,
  postAuthorId,
}: CommentsSectionProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId, page],
    queryFn: () =>
      api.get<PaginatedResponse<CommentPublic>>(
        `/posts/${postId}/comments?page=${page}&limit=20`,
      ),
    enabled: !!postId,
  });

  const createMutation = useMutation({
    mutationFn: (data: { body: string; parentId?: string }) =>
      api.post(`/posts/${postId}/comments`, data),
    onSuccess: (_response, variables) => {
      setNewComment('');
      setReplyText('');
      setReplyingToId(null);
      
      // If it's a top-level comment, reset to page 1 to see it
      if (!variables.parentId && page > 1) {
        setPage(1);
      }
      
      // Invalidate and refetch all comments for all pages
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      
      // If it's a top-level comment, refetch page 1 to see it
      if (!variables.parentId) {
        queryClient.refetchQueries({ 
          queryKey: ['comments', postId, 1],
          exact: false 
        });
      } else {
        // For replies, refetch current page to see the reply
        queryClient.refetchQueries({ 
          queryKey: ['comments', postId],
          exact: false 
        });
      }
      
      toast({
        title: variables.parentId ? 'Reply posted!' : 'Comment posted!',
        description: variables.parentId
          ? 'Your reply has been added.'
          : 'Your comment has been added.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to post comment',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/posts/${postId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast({
        title: 'Comment deleted',
        description: 'The comment has been removed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete comment',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const body = removeDuplicateMentions(newComment.trim());
      createMutation.mutate({
        body,
        parentId: undefined,
      });
    }
  };

  const handleSubmitReply = (parentId: string, body: string) => {
    const cleanBody = removeDuplicateMentions(body);
    createMutation.mutate({
      body: cleanBody,
      parentId,
    });
  };

  const handleReply = (comment: CommentPublic) => {
    setReplyingToId(comment.id);
    setReplyText(`@${comment.user.username} `);
  };

  const handleDelete = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(commentId);
    }
  };

  const defaultCanDelete = (
    comment: CommentPublic,
    userRole: string,
    userId: string,
    postAuthorId?: string,
  ): boolean => {
    return (
      userRole === 'ADMIN' ||
      comment.user.id === userId ||
      !!(postAuthorId && postAuthorId === userId)
    );
  };

  const checkCanDelete = canDelete || defaultCanDelete;

  // Flatten comments for display (top-level only, replies are nested)
  const topLevelComments = data?.data || [];

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Comments {data ? `(${data.meta.total})` : ''}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form - Only for top-level comments */}
        {user && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              disabled={createMutation.isPending}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Use @username to mention someone
              </p>
              <Button type="submit" size="sm" className="h-8 px-4" disabled={createMutation.isPending || !newComment.trim()}>
                {createMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Post Comment
              </Button>
            </div>
          </form>
        )}

        {!user && (
          <div className="text-center py-4 border rounded-lg">
            <p className="text-muted-foreground mb-2">Please log in to leave a comment</p>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : topLevelComments.length > 0 ? (
          <>
            <div className="space-y-6">
              {topLevelComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={postId}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  canDelete={checkCanDelete}
                  postAuthorId={postAuthorId}
                  user={user}
                  level={0}
                  replyingToId={replyingToId}
                  setReplyingToId={setReplyingToId}
                  onSubmitReply={handleSubmitReply}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  isSubmittingReply={createMutation.isPending}
                />
              ))}
            </div>
            {data && data.meta.totalPages > 1 && (
              <div className="flex justify-center space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
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
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page === data.meta.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
