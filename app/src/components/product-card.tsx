'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductWithKeywords } from '@/lib/api';
import { Sparkles, Search, Clock, Globe, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{product.productTitle}</CardTitle>
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
              <span>{formatDistanceToNow(new Date(product.lastGenerated))} ago</span>
            </div>
          </div>
          
          {product.lastScraped && (
            <div className="text-xs text-muted-foreground">
              Last scraped: {formatDistanceToNow(new Date(product.lastScraped))} ago
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={() => onScrape(product._id)}
              disabled={isScraping}
              className="flex-1"
              size="sm"
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
        </div>
      </CardContent>
    </Card>
  );
}
