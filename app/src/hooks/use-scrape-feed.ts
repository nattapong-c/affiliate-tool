'use client';

import { useState, useCallback } from 'react';
import { productScraperApi } from '@/lib/api';
import { ScrapeSettings, DEFAULT_SCRAPER_SETTINGS, ScrapeFeedResponse } from '@/types/scrape-settings';
import { toast } from 'sonner';

function getStoredSettings(): ScrapeSettings {
  if (typeof window === 'undefined') return DEFAULT_SCRAPER_SETTINGS;
  const saved = localStorage.getItem('scrape-settings');
  if (!saved) return DEFAULT_SCRAPER_SETTINGS;
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_SCRAPER_SETTINGS;
  }
}

export function useScrapeFeed() {
  const [isScraping, setIsScraping] = useState(false);
  const [lastScrapedAt, setLastScrapedAt] = useState<Date | null>(null);
  const [settings, setSettingsState] = useState<ScrapeSettings>(getStoredSettings);

  const setSettings = useCallback((newSettings: Partial<ScrapeSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('scrape-settings', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const scrapeFeed = useCallback(async (): Promise<ScrapeFeedResponse | null> => {
    setIsScraping(true);
    try {
      const result = await productScraperApi.scrapeFeed(settings);
      setLastScrapedAt(new Date());
      toast.success(`Successfully scraped ${result.postsFound} posts!`);
      return result;
    } catch (error) {
      toast.error('Failed to scrape feed. Please try again.');
      return null;
    } finally {
      setIsScraping(false);
    }
  }, [settings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SCRAPER_SETTINGS);
    toast.success('Settings reset to defaults');
  }, [setSettings]);

  return {
    isScraping,
    lastScrapedAt,
    settings,
    setSettings,
    scrapeFeed,
    resetSettings,
  };
}
