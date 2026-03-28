# Task 027: Comment Generation API Endpoints

## Overview
Expose the comment generation service through REST API endpoints for the frontend to consume.

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
- [x] Depends on: Task 026

## Requirements

### Functional Requirements
1. `POST /api/comments/generate`: Trigger generation for a post and product.
2. `GET /api/comments/post/:postId`: Retrieve existing generated comments for a specific post.
3. `PATCH /api/comments/:id/select`: Save which option the user chose.

### Technical Requirements
1. Implement `service/src/controllers/comment-controller.ts`.
2. Implement `service/src/routes/comment-routes.ts`.
3. Register routes in `service/src/index.ts`.

## Implementation Details

### Files to Create
- `service/src/controllers/comment-controller.ts`
- `service/src/routes/comment-routes.ts`

### Files to Modify
- `service/src/index.ts`

## Acceptance Criteria
- [ ] Endpoints correctly trigger the AI service.
- [ ] Data is saved to MongoDB upon generation.
- [ ] Retrieval of comments by postId works.

## Definition of Done
- [x] Endpoints implemented and tested with Postman/Curl.
- [x] Error handling for missing posts/products implemented.
