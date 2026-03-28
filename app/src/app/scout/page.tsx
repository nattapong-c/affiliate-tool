'use client';

import { useState } from 'react';
import { PostStats } from '@/components/post-stats';
import { PostTable } from '@/components/post-table';
import { PostFilters } from '@/components/post-filters';
import { usePosts, usePostStats } from '@/hooks/use-posts';
import { PostFilterParams } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ScrapeFeedButton } from '@/components/scrape-feed-button';

export default function ScoutPage() {
  const [filters, setFilters] = useState<PostFilterParams>({ limit: 20, page: 1 });
  const { posts, isLoading, pagination, updateStatus, deletePost, refetch: refetchPosts } = usePosts(filters);
  const { refetch: refetchStats } = usePostStats();

  const handleRefresh = () => {
    refetchPosts();
    refetchStats();
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

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
                <ScrapeFeedButton onScrapeComplete={handleRefresh} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
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
              onUpdateStatus={(id, status) => updateStatus({ id, status })}
              onDelete={deletePost}
            />
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {posts.length} of {pagination.total} posts
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Number(pagination.page) - 1)}
                    disabled={Number(pagination.page) <= 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1 mx-2">
                    <span className="text-sm font-medium">{pagination.page}</span>
                    <span className="text-sm text-muted-foreground">/ {pagination.totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Number(pagination.page) + 1)}
                    disabled={!pagination.hasMore}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
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
              onUpdateStatus={(id, status) => updateStatus({ id, status })}
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
              onUpdateStatus={(id, status) => updateStatus({ id, status })}
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
              onUpdateStatus={(id, status) => updateStatus({ id, status })}
              onDelete={deletePost}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
