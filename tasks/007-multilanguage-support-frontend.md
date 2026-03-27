# Task 007: Multi-Language Support - Frontend Language Selector

## Overview
Add language selection UI to allow users to choose keyword output language (English or Thai).

## Type
- [ ] Backend
- [x] Frontend
- [ ] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [ ] Critical (P0)
- [x] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 006 (Backend language support)
- [ ] Blocks: Future tasks (additional languages)

## Requirements

### Functional Requirements
1. Display language selector in keyword generation form
2. Show language options: English (default), Thai
3. Remember user's language preference (localStorage)
4. Display selected language in results
5. Show language badge on each keyword
6. Update history display to show language

### Technical Requirements
1. Use Shadcn UI Select component or Radio Group
2. Store preference in localStorage
3. Pass language to API in generation request
4. Display language code/flag in UI
5. Responsive design for mobile

## Implementation Details

### Files to Create
- `app/src/components/language-selector.tsx` - Language selection component

### Files to Modify
- `app/src/components/keyword-form.tsx` - Add language selector
- `app/src/components/keyword-results.tsx` - Show language on keywords
- `app/src/components/keyword-history.tsx` - Display language in history
- `app/src/lib/api.ts` - Add language to request type
- `app/src/lib/utils.ts` - Add language display helpers

### Code Snippets
```typescript
// app/src/components/language-selector.tsx
'use client';

import { LanguageCode } from '@/lib/api';

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (language: LanguageCode) => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'th', label: 'ไทย (Thai)', flag: '🇹🇭' },
] as const;

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Output Language</label>
      <div className="flex gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              value === lang.code
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-accent border-input'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// app/src/lib/api.ts
export type LanguageCode = 'en' | 'th';

export interface KeywordGenerationRequest {
  productTitle: string;
  productDescription: string;
  category?: string;
  targetAudience?: string;
  language?: LanguageCode; // NEW
}

export interface Keyword {
  text: string;
  category: 'intent' | 'topic';
  relevanceScore: number;
  searchVolume: 'low' | 'medium' | 'high';
  language?: LanguageCode; // NEW
}
```

```typescript
// app/src/lib/utils.ts
export function getLanguageLabel(code: string): string {
  const languages: Record<string, string> = {
    en: 'English',
    th: 'ไทย',
  };
  return languages[code] || code;
}

export function getLanguageFlag(code: string): string {
  const flags: Record<string, string> = {
    en: '🇬🇧',
    th: '🇹🇭',
  };
  return flags[code] || '🌐';
}
```

## Acceptance Criteria

### Must Have
- [ ] Language selector visible in form
- [ ] English and Thai options available
- [ ] Default selection is English
- [ ] Selected language sent to API
- [ ] Language preference saved to localStorage
- [ ] Language displayed on keyword results
- [ ] Language shown in history items

### Should Have
- [ ] Smooth animation on language change
- [ ] Clear visual distinction between languages
- [ ] Mobile-responsive layout
- [ ] Keyboard accessible

## Testing Requirements

### Unit Tests
- [ ] Test language selector renders options
- [ ] Test onChange callback fires
- [ ] Test localStorage persistence

### Integration Tests
- [ ] Test language sent to API
- [ ] Test language displayed in results
- [ ] Test preference persists across page reload

### Manual Testing
- [ ] Select English, generate keywords
- [ ] Select Thai, generate keywords
- [ ] Verify language preference saved
- [ ] Test on mobile device
- [ ] Test keyboard navigation

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Use Shadcn UI Select or Radio Group component for consistency
- Consider adding more languages in the future (design for extensibility)
- Thai text may be longer than English - ensure UI accommodates this
- Test with actual Thai users for UX feedback

## References
- Task 006: `/tasks/006-multilanguage-support-backend.md`
- Shadcn UI Select: https://ui.shadcn.com/docs/components/select
- localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
