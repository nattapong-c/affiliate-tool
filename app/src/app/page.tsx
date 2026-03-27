'use client';

import { KeywordForm } from '@/components/keyword-form';
import { KeywordResults } from '@/components/keyword-results';
import { KeywordHistory } from '@/components/keyword-history';
import { useKeywords } from '@/hooks/use-keywords';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, History } from 'lucide-react';

export default function KeywordsPage() {
  const { history, isLoading } = useKeywords();
  const latestGeneration = history[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Keyword Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Generate Facebook-optimized keywords from Shopee product data using AI
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
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
    </div>
  );
}
