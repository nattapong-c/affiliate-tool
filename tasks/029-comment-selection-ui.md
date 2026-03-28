# Task 029: Comment Preview & Selection UI

## Overview
Implement the UI to display the 3 AI-generated comment options and allow the user to select their favorite one.

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
- [x] Depends on: Task 028

## Requirements

### Functional Requirements
1. Display 3 comment cards/options after generation is complete.
2. Show a loading state during generation.
3. Allow the user to click "Select" on their preferred option.
4. Persist the selection to the database.
5. Once selected, show the saved comment when the user re-opens the modal for that post.

### Technical Requirements
1. Update `app/src/components/comment-generation-modal.tsx` to handle the results view.
2. Use Shadcn UI Card or Radio Group for selection.
3. Implement a "Copy to Clipboard" button for the selected comment.

## Implementation Details

### Files to Modify
- `app/src/components/comment-generation-modal.tsx`
- `app/src/lib/api.ts` (Add comment API methods)

## Acceptance Criteria
- [ ] 3 distinct options are visible after generation.
- [ ] Selecting an option triggers the selection API.
- [ ] Users can copy the generated text.
- [ ] Re-opening the modal shows the previously generated comments.

## Definition of Done
- [x] Result display UI complete.
- [x] Choice persistence implemented.
- [x] Integration testing between frontend and backend complete.
