# Task 032: Intelligent Copy-to-Clipboard

## Overview
Automate the process of appending the product URL to generated comments when they are copied to the clipboard.

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
- [x] Depends on: Task 031

## Requirements

### Functional Requirements
1. When a user clicks "Copy" on a generated comment option in the `CommentGenerationModal`:
    - Retrieve the `productUrl` associated with the current product.
    - Append the URL to the end of the comment text (e.g., "\n\nCheck it out here: [URL]").
    - Copy the combined string to the clipboard.
2. If no `productUrl` is available, copy only the comment text.

### Technical Requirements
1. Update `app/src/components/comment-generation-modal.tsx`.
2. Ensure the `GeneratedComment` object or the modal state has access to the product's `productUrl`.
3. The `productId` field in `GeneratedComment` is currently populated with the `KeywordHistoryItem` which should contain the URL after Task 030/031.

## Implementation Details

### Files to Modify
- `app/src/components/comment-generation-modal.tsx`

## Acceptance Criteria
- [ ] Copying a comment results in the comment text followed by the product link.
- [ ] The formatting (spacing) between comment and link is clean.
- [ ] Handles cases where the link is missing gracefully.

## Definition of Done
- [x] Copy logic updated.
- [x] End-to-end verification (Generate -> Copy -> Paste).
