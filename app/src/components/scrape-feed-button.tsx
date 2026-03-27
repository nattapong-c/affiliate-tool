'use client';

import { Button } from '@/components/ui/button';
import { useScrapeFeed } from '@/hooks/use-scrape-feed';
import { ScrapeSettingsModal } from './scrape-settings-modal';
import { RefreshCw, Settings } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ScrapeFeedButtonProps {
  onScrapeComplete?: () => void;
}

export function ScrapeFeedButton({ onScrapeComplete }: ScrapeFeedButtonProps) {
  const { isScraping, scrapeFeed, lastScrapedAt, settings } = useScrapeFeed();
  const [showSettings, setShowSettings] = useState(false);

  const handleScrape = async () => {
    const result = await scrapeFeed();
    if (result && onScrapeComplete) {
      // Wait a moment for database to save, then refresh
      setTimeout(() => {
        onScrapeComplete();
      }, 1000);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleScrape}
          disabled={isScraping}
          className="gap-2"
          size="sm"
        >
          {isScraping ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Scrape Feed
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSettings(true)}
          title="Scrape settings"
          className="shrink-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {lastScrapedAt && (
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          Last scraped: {formatDistanceToNow(lastScrapedAt, { addSuffix: true })}
        </p>
      )}

      <ScrapeSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
}
