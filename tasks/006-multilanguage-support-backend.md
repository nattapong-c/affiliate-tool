# Task 006: Multi-Language Keyword Support - Backend

## Overview
Add support for generating keywords in multiple languages (English, Thai) based on user preference.

## Type
- [x] Backend
- [ ] Frontend
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
- [x] Depends on: Task 002 (Keyword Strategist Service)
- [x] Blocks: Task 007 (Frontend language selector)

## Requirements

### Functional Requirements
1. Accept language preference in keyword generation request
2. Generate keywords in the specified language (English or Thai)
3. Default to English if no language specified
4. Include language metadata in response
5. Support both English and Thai product inputs

### Technical Requirements
1. Add language parameter to request schema (Zod validation)
2. Update prompt templates to include language instruction
3. Support language codes: 'en' (English), 'th' (Thai)
4. Update TypeScript types for language support
5. Maintain backward compatibility (default: English)

## Implementation Details

### Files to Create
- None (modifications only)

### Files to Modify
- `service/src/types/keyword.ts` - Add language field to request/response schemas
- `service/src/utils/prompt-templates.ts` - Add language-specific prompt instructions
- `service/src/services/keyword-strategist.ts` - Handle language parameter in generation
- `service/src/controllers/keyword-controller.ts` - Validate language input
- `service/src/models/keyword-history.ts` - Add language field to schema

### Code Snippets
```typescript
// service/src/types/keyword.ts
export type LanguageCode = 'en' | 'th';

export const KeywordGenerationRequestSchema = z.object({
  productTitle: z.string().min(1).max(200),
  productDescription: z.string().min(1).max(2000),
  category: z.string().optional(),
  targetAudience: z.string().optional(),
  language: z.enum(['en', 'th']).optional().default('en'), // NEW
});

export interface Keyword {
  text: string;
  category: 'intent' | 'topic';
  relevanceScore: number;
  searchVolume: 'low' | 'medium' | 'high';
  language?: LanguageCode; // NEW
}
```

```typescript
// service/src/utils/prompt-templates.ts
export const LANGUAGE_INSTRUCTIONS = {
  en: 'Generate keywords in ENGLISH only.',
  th: 'Generate keywords in THAI only. Use natural Thai language that Thai users would search for on Facebook.',
};

// Add to prompt:
const languageInstruction = LANGUAGE_INSTRUCTIONS[language];
const prompt = KEYWORD_GENERATION_PROMPT
  .replace('{title}', request.productTitle)
  .replace('{description}', request.productDescription)
  .replace('{category}', request.category || 'General')
  .replace('{language_instruction}', languageInstruction);
```

```typescript
// service/src/models/keyword-history.ts
const KeywordHistorySchema = new Schema({
  // ... existing fields
  language: { 
    type: String, 
    enum: ['en', 'th'], 
    default: 'en' 
  },
});
```

## Acceptance Criteria

### Must Have
- [ ] Language parameter accepts 'en' or 'th'
- [ ] Default language is 'en' when not specified
- [ ] Keywords generated in correct language
- [ ] Language saved to history database
- [ ] Language returned in API response
- [ ] Invalid language codes rejected (400 error)

### Should Have
- [ ] Thai keywords sound natural (not machine-translated)
- [ ] Mixed-language product titles handled gracefully
- [ ] Language-specific prompt optimization

## Testing Requirements

### Unit Tests
- [ ] Test English keyword generation
- [ ] Test Thai keyword generation
- [ ] Test default language (English)
- [ ] Test invalid language code rejection

### Integration Tests
- [ ] Test API with language parameter
- [ ] Test database persistence with language
- [ ] Test prompt includes language instruction

### Manual Testing
- [ ] Generate keywords in English
- [ ] Generate keywords in Thai
- [ ] Verify Thai keywords are natural and relevant
- [ ] Test with mixed English/Thai product titles

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Thai language support requires careful prompt engineering
- Some OpenRouter models may handle Thai better than others
- Consider adding language-specific models in configuration
- Test with native Thai speakers for quality assurance

## References
- Task 002: `/tasks/002-keyword-strategist-service.md`
- OpenAI multilingual models: https://platform.openai.com/docs/models
- Thai language best practices: Internal doc
