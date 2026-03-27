'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keywordApi, KeywordGenerationRequest } from '@/lib/api';

export function useKeywords() {
  const queryClient = useQueryClient();

  const { data: history, isLoading, error } = useQuery({
    queryKey: ['keywords', 'history'],
    queryFn: () => keywordApi.getHistory(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const generateMutation = useMutation({
    mutationFn: (request: KeywordGenerationRequest) => 
      keywordApi.generate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords', 'history'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => keywordApi.deleteHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords', 'history'] });
    }
  });

  return {
    history: history || [],
    isLoading,
    error,
    generateKeywords: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    deleteHistory: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  };
}
