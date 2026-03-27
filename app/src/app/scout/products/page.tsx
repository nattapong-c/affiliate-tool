'use client';

import { useState } from 'react';
import { ProductList } from '@/components/product-list';
import { useProductScraper } from '@/hooks/use-product-scraper';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'th'>('all');
  const { products, isLoading, scrapeProduct, isScraping } = useProductScraper();

  const handleScrape = (productId: string) => {
    scrapeProduct({ 
      id: productId,
      options: { maxResults: 20, daysBack: 30 }
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || 
      product.language === languageFilter;
    
    return matchesSearch && matchesLanguage;
  });

  const handleReset = () => {
    setSearchQuery('');
    setLanguageFilter('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/scout">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">📦 Select Product to Scrape</h1>
            <p className="text-muted-foreground">
              Choose a product to search Facebook using its generated keywords
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end mb-6 p-4 border rounded-lg bg-card">
          <div className="flex-1 min-w-[250px] space-y-2">
            <label className="text-sm font-medium">Search Products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-[200px] space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select value={languageFilter} onValueChange={(v: any) => setLanguageFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="en">English 🇬🇧</SelectItem>
                <SelectItem value="th">Thai 🇹🇭</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            title="Reset filters"
            className="mb-[1px]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Product List */}
        <ProductList
          products={filteredProducts}
          onScrape={handleScrape}
          isScraping={isScraping}
          scrapingProductId={isScraping ? undefined : undefined}
          isLoading={isLoading}
        />

        {/* Stats */}
        <div className="mt-8 text-sm text-muted-foreground text-center">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
    </div>
  );
}
