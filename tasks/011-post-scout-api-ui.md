# Task 011: Post Scout - API & Dashboard UI

## Overview
Create REST API endpoints for post data and build a dashboard UI to view, filter, and manage scraped Facebook posts.

## Type
- [x] Backend
- [x] Frontend
- [x] Database
- [ ] Integration
- [x] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Critical (P0)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 010 (Post Filtering)
- [ ] Blocks: Phase 3 (Engagement Specialist)

## Requirements

### Functional Requirements
1. API endpoint to get filtered posts
2. API endpoint to get post by ID
3. API endpoint to update post status
4. Dashboard to view scraped posts
5. Filter posts by engagement, date, language
6. View post details in modal
7. Export posts to CSV
8. Mark posts as processed/engaged

### Technical Requirements
1. ElysiaJS REST API endpoints
2. NextJS dashboard page
3. React Query for data fetching
4. Shadcn UI components (table, filters, modal)
5. Pagination for large datasets
6. Real-time updates with React Query refetch

## Implementation Details

### Files to Create
**Backend:**
- `service/src/controllers/post-scout-controller.ts` - Post scout API
- `service/src/routes/post-scout-routes.ts` - Scout routes
- `service/src/services/post-analytics-service.ts` - Analytics

**Frontend:**
- `app/src/app/scout/page.tsx` - Main scout dashboard
- `app/src/components/post-table.tsx` - Post list table
- `app/src/components/post-filters.tsx` - Filter controls
- `app/src/components/post-detail-modal.tsx` - Post detail view
- `app/src/components/post-stats.tsx` - Statistics cards
- `app/src/hooks/use-posts.ts` - Post data hook

### Files to Modify
- `service/src/index.ts` - Add scout routes
- `app/src/app/page.tsx` - Add navigation to scout

### Code Snippets
```typescript
// service/src/routes/post-scout-routes.ts
export function createPostScoutRoutes() {
  return new Elysia({ prefix: '/api/posts' })
    // Get filtered posts
    .get('/', ({ query }) => postScoutController.getPosts(query))
    // Get post by ID
    .get('/:id', ({ params: { id } }) => postScoutController.getPostById(id))
    // Update post status
    .patch('/:id/status', ({ params: { id }, body }) => 
      postScoutController.updatePostStatus(id, body)
    )
    // Get analytics
    .get('/analytics/summary', () => postScoutController.getAnalytics())
    // Export to CSV
    .get('/export', ({ query }) => postScoutController.exportToCsv(query));
}
```

```typescript
// app/src/app/scout/page.tsx
'use client';

import { PostTable } from '@/components/post-table';
import { PostFilters } from '@/components/post-filters';
import { PostStats } from '@/components/post-stats';
import { usePosts } from '@/hooks/use-posts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ScoutPage() {
  const { posts, isLoading, filters, setFilters } = usePosts();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 Post Scout</h1>
        <p className="text-muted-foreground">
          Find and manage high-engagement Facebook posts
        </p>
      </div>

      <PostStats />

      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
          <TabsTrigger value="engaged">Engaged</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <PostFilters filters={filters} onFilterChange={setFilters} />
          <PostTable posts={posts} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

```typescript
// app/src/components/post-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrapedPost } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface PostTableProps {
  posts: ScrapedPost[];
  isLoading: boolean;
}

export function PostTable({ posts, isLoading }: PostTableProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Content</TableHead>
          <TableHead>Engagement</TableHead>
          <TableHead>Density</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="max-w-md truncate">
              {post.content.substring(0, 100)}...
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Badge variant="secondary">❤️ {post.engagement.likes}</Badge>
                <Badge variant="secondary">💬 {post.engagement.comments}</Badge>
                <Badge variant="secondary">🔄 {post.engagement.shares}</Badge>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={post.engagementDensity > 10 ? 'default' : 'secondary'}>
                {post.engagementDensity.toFixed(2)}
              </Badge>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </TableCell>
            <TableCell>
              <StatusBadge status={post.status} />
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Acceptance Criteria

### Must Have
- [ ] GET /api/posts returns filtered posts
- [ ] GET /api/posts/:id returns post details
- [ ] PATCH /api/posts/:id/status updates status
- [ ] Dashboard displays posts in table
- [ ] Filter by status, date, engagement
- [ ] Post detail modal works
- [ ] Export to CSV functionality
- [ ] Statistics cards show totals

### Should Have
- [ ] Pagination for large datasets
- [ ] Sort by engagement/density
- [ ] Search post content
- [ ] Bulk status update
- [ ] Real-time updates

## Testing Requirements

### Unit Tests
- [ ] Test API endpoints
- [ ] Test filter logic
- [ ] Test engagement display formatting

### Integration Tests
- [ ] Test full CRUD operations
- [ ] Test filter combinations
- [ ] Test CSV export

### Manual Testing
- [ ] Test all filters work
- [ ] Test pagination
- [ ] Test modal displays correctly
- [ ] Test export functionality

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Use Shadcn UI Table component
- Implement virtual scrolling for large datasets
- Consider server-side pagination for performance

## References
- Task 010: `/tasks/010-post-scout-filtering.md`
- Shadcn UI Table: https://ui.shadcn.com/docs/components/table
