'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi, GeneratedComment } from '@/lib/api';

export function useComments(postId?: string) {
  const queryClient = useQueryClient();

  const { data: comments, isLoading, refetch } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => postId ? commentApi.getByPost(postId) : Promise.resolve([]),
    enabled: !!postId,
  });

  const generateMutation = useMutation({
    mutationFn: ({ postId, productId, settings }: { postId: string, productId: string, settings: any }) => 
      commentApi.generate(postId, productId, settings),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    }
  });

  const selectMutation = useMutation({
    mutationFn: ({ commentId, index, postId }: { commentId: string, index: number, postId: string }) => 
      commentApi.selectOption(commentId, index),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    }
  });

  return {
    comments: comments || [],
    isLoading,
    generateComments: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    selectComment: selectMutation.mutateAsync,
    isSelecting: selectMutation.isPending,
    refetch
  };
}
