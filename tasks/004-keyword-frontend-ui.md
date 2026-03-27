# Task 004: Keyword Generator - Frontend UI

## Overview
Create a user interface for managing keyword generation using NextJS, Shadcn UI, and React Query.

## Type
- [ ] Backend
- [x] Frontend
- [ ] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Critical (P0)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 001 (project setup), Task 003 (API endpoints)
- [x] Blocks: Task 005 (integration testing)

## Requirements

### Functional Requirements
1. Display form for entering product title and description
2. Show keyword generation results with categories
3. Display keyword metrics (relevance score, search volume)
4. Show generation history
5. Allow filtering by keyword category (intent/topic)
6. Copy keywords to clipboard
7. Export keywords as CSV

### Technical Requirements
1. Use NextJS 14+ with App Router
2. Use Shadcn UI components
3. Use React Query for data fetching
4. Use Tailwind CSS for styling
5. Use Lucide React for icons
6. Responsive design (mobile-first)
7. TypeScript for type safety

## Implementation Details

### Files to Create
- `app/src/lib/api.ts` - API client (Eden Treaty)
- `app/src/lib/utils.ts` - Utility functions
- `app/src/hooks/use-keywords.ts` - Keyword generation hook
- `app/src/components/keyword-form.tsx` - Input form
- `app/src/components/keyword-results.tsx` - Results display
- `app/src/components/keyword-history.tsx` - History list
- `app/src/components/keyword-card.tsx` - Individual keyword card
- `app/src/components/ui/*` - Shadcn UI components
- `app/src/app/page.tsx` - Main page (modify)
- `app/src/app/keywords/page.tsx` - Keywords management page

### Files to Modify
- `app/src/app/page.tsx` - Add navigation to keywords page

### Code Snippets
```typescript
// app/src/lib/api.ts
import { treaty } from '@elysiajs/eden';
import type { App } from '../../../service/src/index';

export const api = treaty<App>('http://localhost:8080');

export interface KeywordGenerationRequest {
  productTitle: string;
  productDescription: string;
  category?: string;
  targetAudience?: string;
}

export const keywordApi = {
  generate: async (request: KeywordGenerationRequest) => {
    const { data, error } = await api.api.keywords.generate.post(request);
    if (error) throw new Error(error.value);
    return data;
  },

  getHistory: async () => {
    const { data, error } = await api.api.keywords.history.get();
    if (error) throw new Error(error.value);
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await api.api.keywords[id].get();
    if (error) throw new Error(error.value);
    return data;
  }
};
```

```typescript
// app/src/hooks/use-keywords.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keywordApi, KeywordGenerationRequest } from '@/lib/api';

export function useKeywords() {
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ['keywords', 'history'],
    queryFn: () => keywordApi.getHistory()
  });

  const generateMutation = useMutation({
    mutationFn: (request: KeywordGenerationRequest) => 
      keywordApi.generate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords', 'history'] });
    }
  });

  return {
    history: history?.data || [],
    isLoading,
    generateKeywords: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending
  };
}
```

```typescript
// app/src/components/keyword-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useKeywords } from '@/hooks/use-keywords';

interface KeywordFormProps {
  onSuccess?: () => void;
}

export function KeywordForm({ onSuccess }: KeywordFormProps) {
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [category, setCategory] = useState('');
  const { generateKeywords, isGenerating } = useKeywords();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await generateKeywords({
        productTitle,
        productDescription,
        category: category || undefined
      });
      
      // Clear form
      setProductTitle('');
      setProductDescription('');
      setCategory('');
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to generate keywords:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Keywords</CardTitle>
        <CardDescription>
          Enter Shopee product details to generate Facebook-optimized keywords
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Product Title *
            </label>
            <Input
              id="title"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="e.g., Wireless Bluetooth Earbuds TWS"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Product Description *
            </label>
            <Textarea
              id="description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Enter product features, specifications, and benefits..."
              required
              maxLength={2000}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category (Optional)
            </label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Electronics, Audio, Accessories"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isGenerating || !productTitle || !productDescription}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Keywords
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

```typescript
// app/src/components/keyword-results.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Keyword } from '../../../service/src/types/keyword';
import { Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';

interface KeywordResultsProps {
  keywords: Keyword[];
  processingTimeMs: number;
  cacheHit: boolean;
}

export function KeywordResults({ keywords, processingTimeMs, cacheHit }: KeywordResultsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const intentKeywords = keywords.filter(k => k.category === 'intent');
  const topicKeywords = keywords.filter(k => k.category === 'topic');

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToCSV = () => {
    const csv = [
      ['Keyword', 'Category', 'Relevance Score', 'Search Volume'],
      ...keywords.map(k => [k.text, k.category, k.relevanceScore, k.searchVolume])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generated Keywords</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={cacheHit ? 'secondary' : 'default'}>
              {cacheHit ? 'Cached' : 'Fresh'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {processingTimeMs}ms
            </span>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Intent-based Keywords */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            Intent-based ({intentKeywords.length})
            <Badge variant="outline">High Purchase Intent</Badge>
          </h3>
          <div className="grid gap-2">
            {intentKeywords.map((keyword, idx) => (
              <KeywordCard
                key={idx}
                keyword={keyword}
                onCopy={() => copyToClipboard(keyword.text, `intent-${idx}`)}
                copied={copiedId === `intent-${idx}`}
                getRelevanceColor={getRelevanceColor}
              />
            ))}
          </div>
        </div>

        {/* Topic-based Keywords */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            Topic-based ({topicKeywords.length})
            <Badge variant="outline">Discussion Topics</Badge>
          </h3>
          <div className="grid gap-2">
            {topicKeywords.map((keyword, idx) => (
              <KeywordCard
                key={idx}
                keyword={keyword}
                onCopy={() => copyToClipboard(keyword.text, `topic-${idx}`)}
                copied={copiedId === `topic-${idx}`}
                getRelevanceColor={getRelevanceColor}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KeywordCard({ keyword, onCopy, copied, getRelevanceColor }: any) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
      <div className="flex-1">
        <p className="font-medium">{keyword.text}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getRelevanceColor(keyword.relevanceScore)}`} />
            <span className="text-xs text-muted-foreground">
              Relevance: {keyword.relevanceScore}%
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {keyword.searchVolume} volume
          </Badge>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onCopy}>
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
```

```typescript
// app/src/app/keywords/page.tsx
'use client';

import { KeywordForm } from '@/components/keyword-form';
import { KeywordResults } from '@/components/keyword-results';
import { KeywordHistory } from '@/components/keyword-history';
import { useKeywords } from '@/hooks/use-keywords';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function KeywordsPage() {
  const { history, isLoading } = useKeywords();
  const latestGeneration = history[0];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Keyword Generator</h1>
        <p className="text-muted-foreground">
          Generate Facebook-optimized keywords from Shopee product data
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <KeywordForm />
          {latestGeneration && (
            <KeywordResults
              keywords={latestGeneration.keywords}
              processingTimeMs={latestGeneration.processingTimeMs}
              cacheHit={latestGeneration.cacheHit}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          <KeywordHistory history={history} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Acceptance Criteria

### Must Have
- [ ] Form accepts product title, description, and category
- [ ] Displays generated keywords with categories (intent/topic)
- [ ] Shows relevance score with color indicator
- [ ] Shows search volume badge
- [ ] Copy to clipboard functionality
- [ ] Export to CSV functionality
- [ ] Shows generation history
- [ ] Loading states during generation
- [ ] Error handling and display
- [ ] Responsive design (mobile-friendly)

### Should Have
- [ ] Cache hit/miss indicator
- [ ] Processing time display
- [ ] Filter by keyword category
- [ ] Search in history
- [ ] Delete history items

## Testing Requirements

### Unit Tests
- [ ] Test form validation
- [ ] Test API client functions
- [ ] Test keyword card rendering
- [ ] Test copy to clipboard

### Integration Tests
- [ ] Test full generation flow
- [ ] Test history loading
- [ ] Test CSV export

### Manual Testing
- [ ] Test on mobile device
- [ ] Test with long product titles
- [ ] Test error scenarios
- [ ] Test copy functionality
- [ ] Test CSV export

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Use Shadcn UI components for consistency
- Ensure proper loading and error states
- Mobile-first responsive design

## References
- Task 001: `/tasks/001-project-setup.md`
- Task 003: `/tasks/003-keyword-api-endpoints.md`
- Shadcn UI: https://ui.shadcn.com
- NextJS docs: https://nextjs.org/docs
