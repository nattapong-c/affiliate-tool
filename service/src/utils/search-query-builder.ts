import pino from 'pino';

const logger = pino();

export interface SearchQueryParams {
  keywords: string[];
  pages?: string[]; // Liked pages to search
  dateFrom: Date;
  dateTo: Date;
  maxResults: number;
}

export class SearchQueryBuilder {
  /**
   * Build Facebook search URL from keywords
   */
  buildSearchUrl(keywords: string[], pageName?: string): string {
    // Facebook search query format
    const query = keywords.join(' OR ');
    const encodedQuery = encodeURIComponent(query);
    
    let url = `https://www.facebook.com/search/posts/?q=${encodedQuery}`;
    
    if (pageName) {
      url += `&sf=author&user=${encodeURIComponent(pageName)}`;
    }
    
    logger.info({ keywords, pageName, url }, 'Built search URL');
    return url;
  }

  /**
   * Build date filter for Facebook search
   * Facebook uses Unix timestamps for date filtering
   */
  buildDateFilter(daysBack: number = 30): { start: number; end: number } {
    const end = Date.now();
    const start = end - (daysBack * 24 * 60 * 60 * 1000);
    
    logger.info({ daysBack, start, end }, 'Built date filter');
    return { start, end };
  }

  /**
   * Convert keywords to search-optimized format
   * Removes special characters and normalizes text
   */
  optimizeKeywords(keywords: string[]): string[] {
    return keywords
      .map(keyword => 
        keyword
          .toLowerCase()
          .replace(/[^\w\s\u0E00-\u0E7F]/g, '') // Keep Thai characters
          .trim()
          .split(/\s+/)
          .filter(word => word.length > 2) // Remove very short words
      )
      .flat()
      .slice(0, 10); // Limit to 10 keywords for search
  }

  /**
   * Build search query for specific post types
   */
  buildPostTypeQuery(keywords: string[], postType: 'posts' | 'photos' | 'videos'): string {
    const baseQuery = keywords.join(' OR ');
    
    switch (postType) {
      case 'photos':
        return `${baseQuery} photos`;
      case 'videos':
        return `${baseQuery} videos`;
      default:
        return baseQuery;
    }
  }

  /**
   * Build search query with location filter
   */
  buildLocationQuery(keywords: string[], location: string): string {
    return `${keywords.join(' OR ')} ${location}`;
  }

  /**
   * Parse Facebook search results URL to extract pagination info
   */
  parsePagination(url: string): { hasMore: boolean; nextCursor?: string } {
    try {
      const urlObj = new URL(url);
      const cursor = urlObj.searchParams.get('cursor');
      
      return {
        hasMore: !!cursor,
        nextCursor: cursor || undefined
      };
    } catch {
      return { hasMore: false };
    }
  }

  /**
   * Validate search query parameters
   */
  validateQuery(params: SearchQueryParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.keywords || params.keywords.length === 0) {
      errors.push('Keywords are required');
    }

    if (params.keywords.length > 20) {
      errors.push('Maximum 20 keywords allowed');
    }

    if (params.maxResults < 1 || params.maxResults > 100) {
      errors.push('Max results must be between 1 and 100');
    }

    if (params.dateFrom > params.dateTo) {
      errors.push('Date from must be before date to');
    }

    const daysDiff = (params.dateTo.getTime() - params.dateFrom.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 90) {
      errors.push('Date range cannot exceed 90 days');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const searchQueryBuilder = new SearchQueryBuilder();
