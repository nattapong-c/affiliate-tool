# Task 013: Manual Product Selection - Frontend UI

## Overview
Create frontend UI components for selecting products and triggering Facebook scraping with selected product's keywords.

## Type
- [ ] Backend
- [x] Frontend
- [ ] Database
- [x] Integration
- [x] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Critical (P0)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 012 (Backend API)
- [ ] Blocks: Future enhancements

## Requirements

### Functional Requirements
1. Display list of products with keyword counts
2. Show product details (category, language, last generated)
3. "Scrape Now" button for each product
4. Show scraping progress/status
5. Display scraping results
6. Filter products by language
7. Search products by name
8. Show scraping history per product

### Technical Requirements
1. Create new page at /scout/products
2. React Query for data fetching
3. Shadcn UI components (Card, Button, Select, etc.)
4. Real-time status updates (polling or WebSocket)
5. Loading states and error handling
6. Responsive design for mobile

## Implementation Details

### Files to Create
- `app/src/app/scout/products/page.tsx` - Product selector page
- `app/src/components/product-list.tsx` - Product list component
- `app/src/components/product-card.tsx` - Individual product card
- `app/src/components/product-scrape-button.tsx` - Scrape trigger button
- `app/src/components/scrape-progress.tsx` - Progress indicator
- `app/src/hooks/use-products.ts` - Product data hook

### Files to Modify
- `app/src/app/scout/page.tsx` - Add link to product selector
- `app/src/lib/api.ts` - Add product scraper API functions

### Code Snippets
```typescript
// app/src/components/product-card.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductWithKeywords } from '@/lib/api';
import { Sparkles, Search, Clock, Globe } from 'lucide-react';

interface ProductCardProps {
  product: ProductWithKeywords;
  onScrape: (productId: string) => void;
  isScraping?: boolean;
}

export function ProductCard({ product, onScrape, isScraping }: ProductCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{product.productTitle}</CardTitle>
            {product.category && (
              <Badge variant="secondary" className="mt-1">
                {product.category}
              </Badge>
            )}
          </div>
          <Badge variant="outline">
            <Globe className="h-3 w-3 mr-1" />
            {product.language === 'en' ? '🇬🇧' : '🇹🇭'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>{product.keywordCount} keywords</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(product.lastGenerated)} ago</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => onScrape(product._id)}
              disabled={isScraping}
              className="flex-1"
            >
              {isScraping ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Scrape Now
                </>
              )}
            </Button>
          </div>
          
          {product.lastScraped && (
            <p className="text-xs text-muted-foreground">
              Last scraped: {formatDistanceToNow(product.lastScraped)} ago
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// app/src/app/scout/products/page.tsx
'use client';

import { useState } from 'react';
import { ProductList } from '@/components/product-list';
import { useProductScraper } from '@/hooks/use-products';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'th'>('all');
  const { products, isLoading, scrapeProduct, isScraping } = useProductScraper();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || 
      product.language === languageFilter;
    
    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📦 Select Product to Scrape</h1>
          <p className="text-muted-foreground">
            Choose a product to search Facebook using its generated keywords
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={languageFilter} onValueChange={(v: any) => setLanguageFilter(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="th">Thai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product List */}
        <ProductList
          products={filteredProducts}
          onScrape={scrapeProduct}
          isScraping={isScraping}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
```

## Acceptance Criteria

### Must Have
- [ ] Products page displays at /scout/products
- [ ] Product cards show title, category, language, keyword count
- [ ] "Scrape Now" button triggers scraping
- [ ] Loading state during scraping
- [ ] Success/error notifications
- [ ] Search filter works
- [ ] Language filter works
- [ ] Responsive design

### Should Have
- [ ] Show last scraped time
- [ ] Show scraping progress
- [ ] Auto-refresh after scraping
- [ ] Empty state when no products
- [ ] Sort by date or keyword count

## Testing Requirements

### Unit Tests
- [ ] Test product card rendering
- [ ] Test filter logic
- [ ] Test scrape button state

### Integration Tests
- [ ] Test API integration
- [ ] Test scraping flow
- [ ] Test error handling

### Manual Testing
- [ ] Test with multiple products
- [ ] Test filters
- [ ] Test scraping for each product
- [ ] Test on mobile device

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Use existing Shadcn UI components
- Follow existing design patterns from Keyword Generator
- Consider adding a "Scrape All" button in future
- Scraping may take 30-60 seconds - show progress

## References
- Task 012: `/tasks/012-manual-product-selection-backend.md`
- Shadcn UI: https://ui.shadcn.com
