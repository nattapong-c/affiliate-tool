'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi, ScrapedPost, PostFilterParams } from '@/lib/api';

export function usePosts(filter?: PostFilterParams) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', filter],
    queryFn: () => postApi.getPosts(filter || {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ScrapedPost['status'] }) =>
      postApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    posts: data?.posts || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    deletePost: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

export function usePostStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['post-stats'],
    queryFn: () => postApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    stats: data,
    isLoading,
    error,
  };
}

export function useHighEngagementPosts(minDensity?: number, limit?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['high-engagement-posts', minDensity, limit],
    queryFn: () => postApi.getHighEngagement(minDensity, limit),
    staleTime: 5 * 60 * 1000,
  });

  return {
    posts: data || [],
    isLoading,
    error,
  };
}

export function usePostsForEngagement(limit?: number) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts-for-engagement', limit],
    queryFn: () => postApi.getForEngagement(limit),
    staleTime: 2 * 60 * 1000,
  });

  const markAsEngagedMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      postApi.updateStatus(id, 'engaged'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts-for-engagement'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    posts: data || [],
    isLoading,
    error,
    markAsEngaged: markAsEngagedMutation.mutate,
    isMarking: markAsEngagedMutation.isPending,
  };
}
