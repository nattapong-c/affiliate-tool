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
  const { settings, setSettings, resetSettings } = useScrapeFeed();

  const handleSave = (newSettings: any) => {
    setSettings(newSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>⚙️ Scrape Settings</DialogTitle>
          <DialogDescription>
            Configure how Facebook feed scraping works. These settings will be saved.
          </DialogDescription>
        </DialogHeader>

        <ScrapeSettingsForm
          settings={settings}
          onSave={handleSave}
          onCancel={handleCancel}
          onReset={resetSettings}
        />
      </DialogContent>
    </Dialog>
  );
}
