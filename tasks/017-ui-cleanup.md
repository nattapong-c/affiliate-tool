# Task 017: UI Cleanup - Remove Unused Components and Pages

## Overview
Clean up the frontend by removing all components, pages, and code related to keyword-based scraping and product selection. Simplify the UI to focus on feed-based post scraping and display.

## Type
- [ ] Backend
- [x] Frontend
- [ ] Database
- [ ] Integration
- [x] Testing
- [x] Documentation

## Priority
- [x] High (P1)
- [ ] Critical (P0)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 016 (Feed-Based Scraping)
- [ ] Blocks: Future UI enhancements

## Requirements

### Functional Requirements
1. Remove /scout/products page completely
2. Remove all product selection UI components
3. Remove "Scrape Now" buttons from keyword history
4. Remove keyword preview expand functionality (keep simple display)
5. Simplify navigation (remove unnecessary back buttons)
6. Update main navigation to reflect new flow
7. Remove unused API hooks and functions
8. Clean up imports and unused dependencies

### Technical Requirements
1. Delete unused component files
2. Remove unused route handlers
3. Clean up package.json (remove unused dependencies)
4. Update TypeScript types
5. Remove dead code and unused imports
6. Update navigation structure
7. Simplify page layouts
8. Update environment variables

## Implementation Details

### Files to Delete
- `app/src/app/scout/products/page.tsx`
- `app/src/components/product-card.tsx`
- `app/src/components/product-list.tsx`
- `app/src/components/product-filters.tsx` (if exists)
- `app/src/components/post-stats.tsx` (replace with simpler version)
- `app/src/components/post-filters.tsx` (simplify)
- `app/src/hooks/use-product-scraper.ts`
- `app/src/lib/product-api.ts` (if exists)

### Files to Modify
- `app/src/app/scout/page.tsx` - Simplify to feed posts only
- `app/src/app/page.tsx` - Remove scrape from history
- `app/src/components/keyword-history.tsx` - Remove scrape button
- `app/src/components/history-item.tsx` - Remove scrape action
- `app/src/lib/api.ts` - Remove product scraper API
- `app/src/components/keyword-preview.tsx` - Simplify or remove
- `app/src/app/layout.tsx` - Update navigation
- `app/package.json` - Remove unused dependencies

### Code Snippets
```typescript
// app/src/components/history-item.tsx - Simplified
export function HistoryItem({ item, onDelete }: HistoryItemProps) {
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
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{item.keywords.length} keywords</span>
              <span>Generated {formatDistanceToNow(new Date(item.createdAt))} ago</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeywords(!showKeywords)}
            >
              {showKeywords ? 'Hide' : 'View'} Keywords
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showKeywords && (
          <div className="flex flex-wrap gap-2">
            {item.keywords.map((keyword, idx) => (
              <Badge key={idx} variant="secondary">
                {keyword.text}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// app/src/app/scout/page.tsx - Simplified
export default function ScoutPage() {
  const { posts, isLoading, refreshFeed } = useFeedPosts();
  const [filters, setFilters] = useState({ minEngagement: 10 });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">📰 Facebook Feed Posts</h1>
            <p className="text-muted-foreground">
              High-engagement posts from your Facebook feed
            </p>
          </div>
          
          <Button onClick={refreshFeed} disabled={isLoading}>
            <Refresh className="h-4 w-4 mr-2" />
            {isLoading ? 'Loading...' : 'Refresh Feed'}
          </Button>
        </div>

        <EngagementFilters filters={filters} onFilterChange={setFilters} />
        <FeedPostsTable posts={posts} isLoading={isLoading} />
      </div>
    </div>
  );
}
```

## Acceptance Criteria

### Must Have
- [ ] /scout/products page returns 404
- [ ] No product-related components in codebase
- [ ] No scrape buttons in history items
- [ ] Navigation simplified
- [ ] No console errors about missing components
- [ ] Build succeeds without errors
- [ ] No unused imports warnings

### Should Have
- [ ] Reduced bundle size
- [ ] Faster page loads
- [ ] Cleaner code structure
- [ ] Better TypeScript type safety
- [ ] Removed unused dependencies

## Testing Requirements

### Manual Testing
- [ ] Navigate to all pages - no 404s except /scout/products
- [ ] Check browser console - no errors
- [ ] Check network tab - no failed API calls
- [ ] Test all remaining functionality works
- [ ] Verify build succeeds

### Code Quality
- [ ] No unused imports
- [ ] No dead code
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] No console warnings

## Definition of Done
- [ ] All unused files deleted
- [ ] All unused imports removed
- [ ] Build succeeds
- [ ] No console errors
- [ ] All pages functional
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- This is cleanup work - be thorough
- Check for any imports of deleted files
- Update any documentation referencing removed features
- Consider running `npx depcheck` to find unused dependencies

## References
- Task 016: `/tasks/016-feed-based-scraping.md`
- Current components to remove: `app/src/components/product-*`
