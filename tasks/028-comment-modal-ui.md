# Task 028: Product Selection & Settings Modal (UI)

## Overview
Implement the frontend modal that allows users to select a Shopee product and configure AI generation settings for a specific post.

## Type
- [ ] Backend
- [x] Frontend
- [ ] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 027

## Requirements

### Functional Requirements
1. Add an "Engage" or "Craft Comment" button to each post in the `PostTable`.
2. Open a modal containing:
    - Product Selector (searchable list of generated products from Phase 1).
    - Language Selector (EN/TH).
    - Emotion/Tone Selector (Helpful, Excited, etc.).
    - Length Slider/Select (Short, Medium, Long).
    - Custom Instructions Textarea.
3. Trigger the generation API when the user clicks "Generate".

### Technical Requirements
1. Create `app/src/components/comment-generation-modal.tsx`.
2. Use Shadcn UI Dialog, Select, and Form components.
3. Use React Query for fetching the product list and triggering the generation mutation.

## Implementation Details

### Files to Create
- `app/src/components/comment-generation-modal.tsx`

### Files to Modify
- `app/src/components/post-table.tsx` (Add action button)

## Acceptance Criteria
- [ ] Modal opens correctly with post context.
- [ ] Users can browse and select existing products.
- [ ] Form validation ensures all required settings are selected.

## Definition of Done
- [x] Modal UI implemented.
- [x] Product selection logic works.
- [x] Ready for result display implementation.
