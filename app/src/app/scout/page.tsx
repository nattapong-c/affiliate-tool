'use client';

import { useState } from 'react';
import { PostStats } from '@/components/post-stats';
import { PostTable } from '@/components/post-table';
import { PostFilters } from '@/components/post-filters';
import { usePosts } from '@/hooks/use-posts';
import { PostFilterParams } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ScrapeFeedButton } from '@/components/scrape-feed-button';

export default function ScoutPage() {
  const [filters, setFilters] = useState<PostFilterParams>({});
  const { posts, isLoading, pagination, updateStatus, deletePost, refetch } = usePosts(filters);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-bold">📰 Facebook Feed Posts</h1>
                </div>
                <p className="text-muted-foreground">
                  High-engagement posts from your Facebook feed
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <ScrapeFeedButton onScrapeComplete={() => refetch()} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <PostStats />

        {/* Main Content */}
        <Tabs defaultValue="all" className="mt-6">
          <TabsList>
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="processed">Processed</TabsTrigger>
            <TabsTrigger value="engaged">Engaged</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <PostFilters filters={filters} onFilterChange={setFilters} />
            <PostTable
              posts={posts}
              isLoading={isLoading}
              onUpdateStatus={updateStatus}
              onDelete={deletePost}
            />
            
            {/* Pagination */}
            {pagination && (
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <p>
                  Showing {posts.length} of {pagination.total} posts
                </p>
                <div className="flex gap-2">
                  <p>
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <PostFilters
              filters={{ ...filters, status: 'new' }}
              onFilterChange={setFilters}
            />
            <PostTable
              posts={posts}
              isLoading={isLoading}
              onUpdateStatus={updateStatus}
              onDelete={deletePost}
            />
          </TabsContent>

          <TabsContent value="processed" className="mt-6">
            <PostFilters
              filters={{ ...filters, status: 'processed' }}
              onFilterChange={setFilters}
            />
            <PostTable
              posts={posts}
              isLoading={isLoading}
              onUpdateStatus={updateStatus}
              onDelete={deletePost}
            />
          </TabsContent>

          <TabsContent value="engaged" className="mt-6">
            <PostFilters
              filters={{ ...filters, status: 'engaged' }}
              onFilterChange={setFilters}
            />
            <PostTable
              posts={posts}
              isLoading={isLoading}
              onUpdateStatus={updateStatus}
              onDelete={deletePost}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
