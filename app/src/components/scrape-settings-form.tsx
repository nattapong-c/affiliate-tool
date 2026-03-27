'use client';

import { useState } from 'react';
import { ScrapeSettings, DEFAULT_SCRAPER_SETTINGS } from '@/types/scrape-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ScrapeSettingsFormProps {
  settings: ScrapeSettings;
  onSave: (settings: ScrapeSettings) => void;
  onCancel: () => void;
  onReset?: () => void;
}

export function ScrapeSettingsForm({
  settings,
  onSave,
  onCancel,
  onReset,
}: ScrapeSettingsFormProps) {
  const [localSettings, setLocalSettings] = useState<ScrapeSettings>(settings);

  const updateSetting = <K extends keyof ScrapeSettings>(
    key: K,
    value: ScrapeSettings[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <div className="space-y-6">
      {/* Scroll Count */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="scrollCount">Scroll Count</Label>
          <span className="text-sm text-muted-foreground">{localSettings.scrollCount} scrolls</span>
        </div>
        <Slider
          id="scrollCount"
          min={1}
          max={10}
          step={1}
          value={[localSettings.scrollCount]}
          onValueChange={(value) => updateSetting('scrollCount', value[0])}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          More scrolls = more posts loaded, but slower
        </p>
      </div>

      {/* Minimum Likes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="minLikes">Minimum Likes</Label>
          <Input
            id="minLikes"
            type="number"
            min={0}
            value={localSettings.minLikes}
            onChange={(e) => updateSetting('minLikes', parseInt(e.target.value) || 0)}
            className="w-24"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Only save posts with at least this many likes
        </p>
      </div>

      {/* Minimum Comments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="minComments">Minimum Comments</Label>
          <Input
            id="minComments"
            type="number"
            min={0}
            value={localSettings.minComments}
            onChange={(e) => updateSetting('minComments', parseInt(e.target.value) || 0)}
            className="w-24"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Only save posts with at least this many comments
        </p>
      </div>

      {/* Minimum Shares */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="minShares">Minimum Shares</Label>
          <Input
            id="minShares"
            type="number"
            min={0}
            value={localSettings.minShares}
            onChange={(e) => updateSetting('minShares', parseInt(e.target.value) || 0)}
            className="w-24"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Only save posts with at least this many shares
        </p>
      </div>

      {/* Maximum Posts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="maxPosts">Maximum Posts</Label>
          <Input
            id="maxPosts"
            type="number"
            min={1}
            max={100}
            value={localSettings.maxPosts}
            onChange={(e) => updateSetting('maxPosts', parseInt(e.target.value) || 20)}
            className="w-24"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Maximum number of posts to save (1-100)
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-2 pt-4 border-t">
        {onReset && (
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
          >
            Reset to Defaults
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
