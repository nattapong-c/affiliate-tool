'use client';

import { LanguageCode } from '@/lib/api';
import { getLanguageFlag, getLanguageLabel } from '@/lib/utils';

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (language: LanguageCode) => void;
}

const LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'th', name: 'ไทย' },
];

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Output Language</label>
      <div className="flex gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.code)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              value === lang.code
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-accent border-input'
            }`}
          >
            <span>{getLanguageFlag(lang.code)}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
