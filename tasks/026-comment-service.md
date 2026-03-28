# Task 026: Comment Crafting Service (AI)

## Overview
Implement the core AI logic to generate 3 natural-sounding Facebook comments that bridge the context of a post with a selected Shopee product.

## Type
- [x] Backend
- [ ] Frontend
- [ ] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 025

## Requirements

### Functional Requirements
1. Accept Facebook post content, product title, product description, and user settings as input.
2. Generate 3 distinct comment options using OpenAI GPT-4o.
3. Comments must be relevant to the post's context but naturally transition to the product.
4. Support emotional tones (e.g., helpful, excited, humorous, professional).
5. Support different lengths (short sentence to medium paragraph).
6. Handle language selection (EN/TH).

### Technical Requirements
1. Create `service/src/services/engagement-specialist.ts`.
2. Implement robust prompt engineering in `service/src/utils/prompt-templates.ts`.
3. Use `json_mode` or structured output to ensure 3 options are returned reliably.

## Implementation Details

### Files to Create
- `service/src/services/engagement-specialist.ts`

### Prompt Strategy
- Post Context: "[Post Text]"
- Product Details: "[Title/Desc/Keywords]"
- Instruction: "Write 3 comments. Bridge the post context to why this product is relevant. Don't be too spammy. Make it sound like a real user."

## Acceptance Criteria
- [ ] Service returns exactly 3 options.
- [ ] Comments reflect the requested tone and language.
- [ ] Comments are logically linked to both the post and the product.

## Definition of Done
- [x] Service implemented and unit tested.
- [x] Prompt templates updated.
