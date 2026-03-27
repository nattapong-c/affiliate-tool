'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productScraperApi, ProductWithKeywords, ScrapeResult } from '@/lib/api';

export function useProductScraper() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productScraperApi.getProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const scrapeMutation = useMutation({
    mutationFn: ({ 
      id, 
      options 
    }: { 
      id: string; 
      options?: { maxResults?: number; daysBack?: number } 
    }) => productScraperApi.triggerScrape(id, options),
    onSuccess: (data: ScrapeResult, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });

  const getProductById = async (id: string) => {
    return productScraperApi.getProductById(id);
  };

  return {
    products,
    isLoading,
    error,
    scrapeProduct: scrapeMutation.mutate,
    isScraping: scrapeMutation.isPending,
    getProductById,
  };
}

export function useProduct(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productScraperApi.getProductById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  return {
    product: data,
    isLoading,
    error,
  };
}

export function useScrapeHistory(id: string, limit?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['scrape-history', id, limit],
    queryFn: () => productScraperApi.getScrapeHistory(id, limit),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  return {
    history: data,
    isLoading,
    error,
  };
}
