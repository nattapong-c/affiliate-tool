# Task 024: Reaction Breakdown UI (Frontend)

## Overview
Update the post table to display the detailed reaction breakdown (Love, Haha, etc.) when the user hovers over the total like count.

## Type
- [ ] Backend
- [x] Frontend
- [ ] Database
- [ ] Integration
- [ ] Testing
- [ ] Documentation

## Priority
- [ ] Critical (P0)
- [ ] High (P1)
- [x] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 023 (Backend reactions)

## Requirements

### Functional Requirements
1. Show a tooltip or popover when the user hovers over the "Likes" badge in the post table.
2. The breakdown should list each reaction type and its count (e.g., ❤️ 12, 😂 4).
3. Only show reaction types that have a count greater than 0.

### Technical Requirements
1. Update `app/src/components/post-table.tsx` or related engagement display component.
2. Use Shadcn UI Tooltip or HoverCard component for the breakdown display.
3. Use relevant emojis or icons for each reaction type.

## Implementation Details

### Files to Modify
- `app/src/components/post-table.tsx`
- `app/src/components/post-stats.tsx` (if shared)

## Acceptance Criteria

### Must Have
- [ ] Hovering over the total like count displays the breakdown of individual reactions.
- [ ] The breakdown is accurate and reflects the backend data.
- [ ] The UI remains responsive and does not flicker on hover.

## Definition of Done
- [x] UI implemented and tested
- [x] Responsive behavior verified
- [x] Integration with API data verified
