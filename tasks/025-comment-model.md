# Task 025: Comment Generation Database Model

## Overview
Implement the database schema to store AI-generated comments, linking them to specific Facebook posts and Shopee products.

## Type
- [ ] Backend
- [ ] Frontend
- [x] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [ ] Critical (P0)
- [x] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Blocks: Task 026, Task 027

## Requirements

### Functional Requirements
1. Store multiple generated versions (options) for a single post-product pair.
2. Link to `ScrapedPost` (by postId or ObjectId).
3. Link to `KeywordHistory` (which represents the Product).
4. Store generation settings (language, emotion, length, custom prompt).
5. Track which option (if any) was selected by the user.

### Technical Requirements
1. Create `service/src/models/generated-comment.ts`.
2. Use Mongoose schema with appropriate indexes.

## Implementation Details

### Files to Create
- `service/src/models/generated-comment.ts`

### Code Snippets
```typescript
interface GeneratedComment {
  postId: string; // Reference to ScrapedPost
  productId: string; // Reference to KeywordHistory/Product
  settings: {
    language: 'en' | 'th';
    emotion: string;
    length: 'short' | 'medium' | 'long';
    customPrompt?: string;
  };
  options: Array<{
    text: string;
    version: number;
  }>;
  selectedOptionIndex?: number;
  status: 'draft' | 'posted';
  createdAt: Date;
}
```

## Acceptance Criteria
- [ ] Mongoose model correctly defined.
- [ ] Relationships between Post, Product, and Comment are clear.
- [ ] Timestamps included.

## Definition of Done
- [x] Schema implemented and exported.
- [x] Ready for service implementation.
