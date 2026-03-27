'use client';

import { ProductWithKeywords } from '@/lib/api';
import { ProductCard } from '@/components/product-card';

interface ProductListProps {
  products: ProductWithKeywords[];
  onScrape: (productId: string) => void;
  isScraping?: boolean;
  scrapingProductId?: string;
  isLoading: boolean;
}

export function ProductList({
  products,
  onScrape,
  isScraping,
  scrapingProductId,
  isLoading,
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Sparkles className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm">Generate keywords for products first</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onScrape={onScrape}
          isScraping={isScraping && scrapingProductId === product._id}
        />
      ))}
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
