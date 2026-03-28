# Task 031: Keyword Generation UI Enhancements

## Overview
Add a product link input field to the keyword generation form on the frontend.

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
- [x] Depends on: Task 030

## Requirements

### Functional Requirements
1. Add an input field labeled "Product Link" or "Affiliate Link" to the `KeywordForm`.
2. This field should allow users to paste a URL.
3. The URL should be sent to the backend when generating keywords.
4. Display the stored URL in the `KeywordHistory` items or `HistoryItem` component.

### Technical Requirements
1. Update `app/src/components/keyword-form.tsx` to include the new field.
2. Update `app/src/lib/api.ts` types to include `productUrl`.
3. Ensure the form state and validation (optional URL) are handled correctly.

## Implementation Details

### Files to Modify
- `app/src/components/keyword-form.tsx`
- `app/src/lib/api.ts`
- `app/src/components/history-item.tsx`

## Acceptance Criteria
- [ ] Users can enter a product link in the keyword generation form.
- [ ] The link is successfully saved and appears in the history.
- [ ] UI is responsive and follows existing design patterns.

## Definition of Done
- [x] Frontend form updated.
- [x] API integration complete.
- [x] History display updated.
