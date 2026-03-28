# Task 030: Product URL Data Persistence

## Overview
Update the `KeywordHistory` model and related backend types to support storing a product URL.

## Type
- [x] Backend
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
- [x] Blocks: Task 031, Task 032

## Requirements

### Functional Requirements
1. Store a `productUrl` string along with product title and description.
2. The URL is optional but recommended.
3. The URL should be returned in API responses when fetching product/keyword history.

### Technical Requirements
1. Update `service/src/models/keyword-history.ts` to include `productUrl`.
2. Update `service/src/types/keyword.ts` to include `productUrl` in the `KeywordGenerationRequest` and `KeywordHistoryItem` types.
3. Ensure the `KeywordController` and `KeywordStrategist` pass this field through correctly to the database.

## Implementation Details

### Files to Modify
- `service/src/models/keyword-history.ts`
- `service/src/types/keyword.ts`
- `service/src/services/keyword-strategist.ts`
- `service/src/controllers/keyword-controller.ts`

## Acceptance Criteria
- [ ] `KeywordHistory` documents in MongoDB now have a `productUrl` field.
- [ ] `POST /api/keywords/generate` accepts `productUrl`.
- [ ] `GET /api/keywords/history` returns the `productUrl`.

## Definition of Done
- [x] Database schema updated.
- [x] Backend types and logic updated.
- [x] Verified with API test.
