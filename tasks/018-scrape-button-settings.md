# Task 018: Manual Scrape Trigger Button & Configuration UI

## Overview
Add a manual "Scrape Feed" button to the Post Scout page with configurable scraping settings (scroll count, engagement thresholds, max posts). Users should be able to customize scraping parameters before triggering.

## Type
- [ ] Backend
- [x] Frontend
- [ ] Database
- [x] Integration
- [ ] Testing
- [x] Documentation

## Priority
- [x] High (P1)
- [ ] Critical (P0)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 016 (Feed-Based Scraping)
- [ ] Blocks: Future enhancements

## Requirements

### Functional Requirements
1. Add "Scrape Feed" button to Post Scout page header
2. Show scraping progress/loading state during scrape
3. Display success/error notification after scrape completes
4. Add settings panel/modal for scrape configuration
5. Allow configuration of: scroll count, min likes, min comments, min shares, max posts
6. Save user's preferred settings (localStorage)
7. Show last scrape timestamp
8. Auto-refresh posts after successful scrape

### Technical Requirements
1. Create scrape settings modal component
2. Add scrape trigger API function to api.ts
3. Add useScrapeFeed hook for state management
4. Add toast notifications for scrape results
5. Store settings in localStorage
6. Add loading/disabled states to button
7. Responsive design for mobile
8. Keyboard shortcuts (optional)

## Implementation Details

### Files to Create
- `app/src/components/scrape-feed-button.tsx` - Main scrape trigger button
- `app/src/components/scrape-settings-modal.tsx` - Settings modal
- `app/src/components/scrape-settings-form.tsx` - Settings form
- `app/src/hooks/use-scrape-feed.ts` - Scrape hook with state management
- `app/src/types/scrape-settings.ts` - Settings types

### Files to Modify
- `app/src/app/scout/page.tsx` - Add scrape button to header
- `app/src/lib/api.ts` - Add scrape feed API function
- `app/src/components/post-filters.tsx` - Add last scrape info
- `app/package.json` - Add sonner if not exists (for toasts)

### Code Snippets
```typescript
// app/src/types/scrape-settings.ts
export interface ScrapeSettings {
  scrollCount: number;      // 1-10
  minLikes: number;         // 0+
  minComments: number;      // 0+
  minShares: number;        // 0+
  maxPosts: number;         // 1-100
}

export const DEFAULT_SCRAPER_SETTINGS: ScrapeSettings = {
  scrollCount: 3,
  minLikes: 0,
  minComments: 0,
  minShares: 0,
  maxPosts: 20,
};

// app/src/hooks/use-scrape-feed.ts
'use client';

import { useState } from 'react';
import { productScraperApi } from '@/lib/api';
import { ScrapeSettings, DEFAULT_SCRAPER_SETTINGS } from '@/types/scrape-settings';
import { toast } from 'sonner';

export function useScrapeFeed() {
  const [isScraping, setIsScraping] = useState(false);
  const [lastScrapedAt, setLastScrapedAt] = useState<Date | null>(null);
  const [settings, setSettings] = useState<ScrapeSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SCRAPER_SETTINGS;
    const saved = localStorage.getItem('scrape-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SCRAPER_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<ScrapeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('scrape-settings', JSON.stringify(updated));
  };

  const scrapeFeed = async () => {
    setIsScraping(true);
    try {
      const result = await productScraperApi.scrapeFeed(settings);
      setLastScrapedAt(new Date());
      toast.success(`Successfully scraped ${result.postsFound} posts!`);
      return result;
    } catch (error) {
      toast.error('Failed to scrape feed. Please try again.');
      throw error;
    } finally {
      setIsScraping(false);
    }
  };

  return {
    isScraping,
    lastScrapedAt,
    settings,
    updateSettings,
    scrapeFeed,
  };
}

// app/src/components/scrape-feed-button.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useScrapeFeed } from '@/hooks/use-scrape-feed';
import { ScrapeSettingsModal } from './scrape-settings-modal';
import { Refresh, Settings } from 'lucide-react';
import { useState } from 'react';

export function ScrapeFeedButton() {
  const { isScraping, scrapeFeed, lastScrapedAt } = useScrapeFeed();
  const [showSettings, setShowSettings] = useState(false);

  const handleScrape = async () => {
    await scrapeFeed();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleScrape}
          disabled={isScraping}
          className="gap-2"
        >
          {isScraping ? (
            <>
              <Refresh className="h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Refresh className="h-4 w-4" />
              Scrape Feed
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSettings(true)}
          title="Scrape settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {lastScrapedAt && (
        <p className="text-xs text-muted-foreground">
          Last scraped: {formatDistanceToNow(lastScrapedAt)} ago
        </p>
      )}

      <ScrapeSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
}

// app/src/components/scrape-settings-modal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrapeSettingsForm } from './scrape-settings-form';
import { useScrapeFeed } from '@/hooks/use-scrape-feed';

interface ScrapeSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScrapeSettingsModal({ open, onOpenChange }: ScrapeSettingsModalProps) {
  const { settings, updateSettings } = useScrapeFeed();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scrape Settings</DialogTitle>
          <DialogDescription>
            Configure how Facebook feed scraping works
          </DialogDescription>
        </DialogHeader>

        <ScrapeSettingsForm
          settings={settings}
          onSave={(newSettings) => {
            updateSettings(newSettings);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
```

## Acceptance Criteria

### Must Have
- [ ] "Scrape Feed" button visible on Post Scout page
- [ ] Button shows loading state during scraping
- [ ] Settings modal opens/closes correctly
- [ ] All settings can be configured (scroll, likes, comments, shares, max posts)
- [ ] Settings persist in localStorage
- [ ] Success toast after successful scrape
- [ ] Error toast after failed scrape
- [ ] Last scrape timestamp displayed
- [ ] Posts auto-refresh after scrape

### Should Have
- [ ] Settings button next to scrape button
- [ ] Keyboard shortcut (e.g., Ctrl+Shift+S)
- [ ] Confirmation dialog before scraping
- [ ] Estimated time display
- [ ] Reset to defaults button

## Testing Requirements

### Unit Tests
- [ ] Test useScrapeFeed hook
- [ ] Test settings persistence
- [ ] Test loading states
- [ ] Test error handling

### Integration Tests
- [ ] Test scrape API call
- [ ] Test settings modal
- [ ] Test toast notifications
- [ ] Test auto-refresh

### Manual Testing
- [ ] Test all settings combinations
- [ ] Test with slow connection
- [ ] Test error scenarios
- [ ] Test on mobile
- [ ] Test keyboard navigation

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive on mobile

## Notes
- Use existing sonner setup for toasts
- Follow existing modal patterns
- Consider rate limiting (disable button during scrape)
- Add validation for settings (min/max values)

## References
- Task 016: `/tasks/016-feed-based-scraping.md`
- Current scout page: `app/src/app/scout/page.tsx`
- Shadcn Dialog: https://ui.shadcn.com/docs/components/dialog
