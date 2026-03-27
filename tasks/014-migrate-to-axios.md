# Task 014: Migrate Frontend API Client to Axios

## Overview
Replace the current Eden Treaty API client with Axios for all frontend API requests to improve flexibility, error handling, and compatibility.

## Type
- [ ] Backend
- [x] Frontend
- [ ] Database
- [x] Integration
- [x] Testing
- [ ] Documentation

## Priority
- [x] High (P1)
- [ ] Critical (P0)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 013 (Product Scraper UI)
- [x] Blocks: Future frontend features

## Requirements

### Functional Requirements
1. Replace Eden Treaty with Axios for all API calls
2. Maintain existing API function signatures
3. Add request/response interceptors
4. Implement proper error handling
5. Add request timeout configuration
6. Support file uploads (for future features)
7. Maintain TypeScript type safety

### Technical Requirements
1. Install Axios and related types
2. Create Axios instance with base configuration
3. Update all API functions in `src/lib/api.ts`
4. Update all hooks to use new Axios client
5. Add request/response types
6. Implement error handling middleware
7. Add loading states
8. Configure CORS if needed

## Implementation Details

### Files to Create
- `app/src/lib/axios.ts` - Axios instance configuration
- `app/src/lib/api-types.ts` - API request/response types
- `app/src/utils/api-error.ts` - API error handling utility
- `app/src/hooks/use-api-error.ts` - Error handling hook

### Files to Modify
- `app/src/lib/api.ts` - Replace Eden with Axios
- `app/src/hooks/use-keywords.ts` - Update to use Axios
- `app/src/hooks/use-posts.ts` - Update to use Axios
- `app/src/hooks/use-product-scraper.ts` - Update to use Axios
- `app/package.json` - Add Axios dependency

### Code Snippets
```typescript
// app/src/lib/axios.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized request');
    }
    
    if (error.response?.status === 404) {
      // Handle not found
      console.error('Resource not found');
    }
    
    if (error.response?.status === 500) {
      // Handle server error
      console.error('Server error');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// app/src/lib/api.ts
import apiClient from './axios';
import { LanguageCode, KeywordGenerationRequest } from './types';

export const keywordApi = {
  generate: async (request: KeywordGenerationRequest) => {
    const response = await apiClient.post('/api/keywords/generate', request);
    return response.data.data;
  },

  getHistory: async () => {
    const response = await apiClient.get('/api/keywords/history');
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/keywords/${id}`);
    return response.data.data;
  },

  deleteHistory: async (id: string) => {
    await apiClient.delete(`/api/keywords/${id}`);
  },
};

export const postApi = {
  getPosts: async (filter: PostFilterParams) => {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.minDensity) params.append('minDensity', filter.minDensity.toString());
    
    const response = await apiClient.get('/api/posts', { params });
    return response.data;
  },

  getStatistics: async () => {
    const response = await apiClient.get('/api/posts/statistics');
    return response.data.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/api/posts/${id}/status`, { status });
    return response.data.data;
  },

  deletePost: async (id: string) => {
    await apiClient.delete(`/api/posts/${id}`);
  },
};

// app/src/utils/api-error.ts
import { AxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const status = error.response?.status || 500;
    const data = error.response?.data as any;
    const message = data?.error?.message || error.message || 'An error occurred';
    const code = data?.error?.code || 'UNKNOWN_ERROR';

    return new ApiError(status, code, message);
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    throw ApiError.fromAxiosError(error);
  }
  throw error;
}
```

## Acceptance Criteria

### Must Have
- [ ] Axios installed and configured
- [ ] All API functions migrated to Axios
- [ ] All hooks updated to use Axios
- [ ] Error handling implemented
- [ ] Request/response interceptors working
- [ ] TypeScript types maintained
- [ ] No breaking changes to component interfaces

### Should Have
- [ ] Request timeout configured
- [ ] Loading states in hooks
- [ ] Error messages user-friendly
- [ ] Axios devtools enabled in development
- [ ] Request logging in development

## Testing Requirements

### Unit Tests
- [ ] Test Axios instance configuration
- [ ] Test request interceptor
- [ ] Test response interceptor
- [ ] Test error handling utility

### Integration Tests
- [ ] Test keyword generation API call
- [ ] Test post fetching API call
- [ ] Test product scraper API call
- [ ] Test error scenarios (404, 500, etc.)

### Manual Testing
- [ ] Test all pages still work
- [ ] Test error states display correctly
- [ ] Test loading states
- [ ] Test network tab shows correct requests
- [ ] Test on slow connections (timeout)

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No console errors
- [ ] All pages functional

## Notes
- Eden Treaty is type-safe but less flexible than Axios
- Axios has better browser support and more features
- Migration should be transparent to components
- Consider adding retry logic in future
- May need to handle CORS if not already configured

## References
- Axios docs: https://axios-http.com/docs/intro
- Task 013: `/tasks/013-manual-product-selection-frontend.md`
- Current API: `app/src/lib/api.ts`
