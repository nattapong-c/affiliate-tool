# Task 015: Keyword History Enhancements - Search, Filter & Scrape

## Overview
Enhance the Keyword Generator history tab with search, filter, keyword preview, and direct scrape functionality to improve user workflow and reduce navigation steps.

## Type
- [ ] Backend
- [x] Frontend
- [ ] Database
- [x] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Critical (P0)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 013 (Product Selection UI)
- [x] Depends on: Task 014 (Axios Migration)
- [ ] Blocks: Future enhancements

## Requirements

### Functional Requirements
1. Add navigation menu/button to return to Keyword Generator from any page
2. Display keyword preview in history items (expandable/collapsible)
3. Add "Scrape Now" button for each history item
4. Add search functionality to filter history by product title
5. Add language filter to history tab
6. Add status indicator showing if post scraping was done
7. Show scrape count per history item
8. Maintain existing history functionality

### Technical Requirements
1. Update KeywordHistory component with search/filter
2. Add new API function to trigger scrape from history
3. Create keyword preview modal/dropdown component
4. Add scrape status tracking to keyword history
5. Implement real-time status updates after scraping
6. Add loading states for scrape actions
7. Responsive design for mobile

## Implementation Details

### Files to Create
- `app/src/components/keyword-preview.tsx` - Keyword preview component
- `app/src/components/history-item.tsx` - Enhanced history item
- `app/src/utils/scrape-status.ts` - Scrape status helper

### Files to Modify
- `app/src/components/keyword-history.tsx` - Add search, filter, actions
- `app/src/components/keyword-form.tsx` - Add back button
- `app/src/app/page.tsx` - Add navigation menu
- `app/src/lib/api.ts` - Add scrape from history function
- `service/src/models/keyword-history.ts` - Add scrape tracking fields
- `service/src/services/product-scraper-service.ts` - Link scrapes to keyword history

### Code Snippets
```typescript
// app/src/components/keyword-preview.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Keyword } from '@/lib/api';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface KeywordPreviewProps {
  keywords: Keyword[];
  language: string;
}

export function KeywordPreview({ keywords, language }: KeywordPreviewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const intentKeywords = keywords.filter(k => k.category === 'intent');
  const topicKeywords = keywords.filter(k => k.category === 'topic');

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div>
        <h4 className="text-sm font-semibold mb-2">
          Intent-based ({intentKeywords.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {intentKeywords.map((keyword, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => copyToClipboard(keyword.text, `intent-${idx}`)}
            >
              {copiedId === `intent-${idx}` ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {keyword.text}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">
          Topic-based ({topicKeywords.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {topicKeywords.map((keyword, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="cursor-pointer hover:bg-background"
              onClick={() => copyToClipboard(keyword.text, `topic-${idx}`)}
            >
              {copiedId === `topic-${idx}` ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {keyword.text}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

// app/src/components/history-item.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeywordHistoryItem } from '@/lib/api';
import { KeywordPreview } from './keyword-preview';
import { Search, Clock, Trash2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface HistoryItemProps {
  item: KeywordHistoryItem;
  onDelete: (id: string) => void;
  onScrape: (item: KeywordHistoryItem) => void;
  isScraping?: boolean;
}

export function HistoryItem({ item, onDelete, onScrape, isScraping }: HistoryItemProps) {
  const [showKeywords, setShowKeywords] = useState(false);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{item.productTitle}</h4>
              <Badge variant="outline">
                {item.language === 'en' ? '🇬🇧' : '🇹🇭'}
              </Badge>
              {item.cacheHit && (
                <Badge variant="secondary">Cached</Badge>
              )}
            </div>
            
            {item.category && (
              <Badge variant="secondary" className="mt-1">
                {item.category}
              </Badge>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>{item.keywords.length} keywords</span>
              </div>
              <div className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                <span>{item.cacheHit ? '0ms' : `${item.processingTimeMs}ms`}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeywords(!showKeywords)}
            >
              {showKeywords ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Keywords
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => onScrape(item)}
              disabled={isScraping}
            >
              {isScraping ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Scrape
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item._id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showKeywords && (
          <KeywordPreview keywords={item.keywords} language={item.language} />
        )}
      </CardContent>
    </Card>
  );
}
```

## Acceptance Criteria

### Must Have
- [ ] Back button visible on all pages to return to Keyword Generator
- [ ] Keyword preview expandable/collapsible in history items
- [ ] "Scrape Now" button on each history item
- [ ] Search input to filter history by product title
- [ ] Language filter dropdown in history tab
- [ ] Loading state during scraping from history
- [ ] Success/error notifications after scrape
- [ ] Keywords can be copied to clipboard

### Should Have
- [ ] Scrape count displayed per history item
- [ ] Last scraped timestamp shown
- [ ] Filter by scrape status (scraped/not scraped)
- [ ] Batch scrape multiple history items
- [ ] Keyboard shortcuts (Enter to search, Escape to close preview)

## Testing Requirements

### Unit Tests
- [ ] Test keyword preview toggle
- [ ] Test copy to clipboard functionality
- [ ] Test search filter logic
- [ ] Test language filter logic

### Integration Tests
- [ ] Test scrape from history triggers correct API call
- [ ] Test history updates after scrape
- [ ] Test navigation back to homepage

### Manual Testing
- [ ] Test on mobile devices
- [ ] Test with long product titles
- [ ] Test with many keywords (50+)
- [ ] Test search with special characters
- [ ] Test all button states (loading, disabled, etc.)

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive on mobile

## Notes
- This reduces navigation steps significantly
- Users can scrape directly from keyword history
- Consider adding rate limiting for scrape actions
- May want to add confirmation dialog before scraping

## References
- Task 013: `/tasks/013-manual-product-selection-frontend.md`
- Current history: `app/src/components/keyword-history.tsx`
- Shadcn UI: https://ui.shadcn.com
