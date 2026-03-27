'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrapedPost } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, Trash2, ExternalLink } from 'lucide-react';

interface PostTableProps {
  posts: ScrapedPost[];
  isLoading: boolean;
  onUpdateStatus?: (id: string, status: ScrapedPost['status']) => void;
  onDelete?: (id: string) => void;
}

export function PostTable({ posts, isLoading, onUpdateStatus, onDelete }: PostTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No posts found</p>
      </div>
    );
  }

  const getStatusColor = (status: ScrapedPost['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500';
      case 'processed':
        return 'bg-yellow-500';
      case 'engaged':
        return 'bg-green-500';
      case 'skipped':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDensityColor = (density: number) => {
    if (density >= 100) return 'text-purple-600 bg-purple-50';
    if (density >= 10) return 'text-green-600 bg-green-50';
    if (density >= 1) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Content</TableHead>
          <TableHead>Engagement</TableHead>
          <TableHead>Density</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post._id}>
            <TableCell className="max-w-md">
              <div className="space-y-1">
                <p className="font-medium line-clamp-2">{post.content.substring(0, 150)}...</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.author.name}</span>
                  <span>•</span>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    View Post <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Heart className="h-3 w-3" />
                  {post.engagement.likes}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {post.engagement.comments}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Share2 className="h-3 w-3" />
                  {post.engagement.shares}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getDensityColor(post.engagementDensity)}>
                {post.engagementDensity.toFixed(2)}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {onUpdateStatus && post.status !== 'engaged' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateStatus(post._id, 'engaged')}
                  >
                    Mark Engaged
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(post._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
