import pino from 'pino';
import { BrowserPool } from '../scrapers/browser-pool';
import { SearchResult, SearchQuery } from '../types/scraper';
import { SearchQueryBuilder } from '../utils/search-query-builder';
import { getRandomDelay } from '../config/stealth-config';

const logger = pino();

export class PostSearchScraper {
  private browserPool: BrowserPool;
  private queryBuilder: SearchQueryBuilder;

  constructor(browserPool: BrowserPool) {
    this.browserPool = browserPool;
    this.queryBuilder = new SearchQueryBuilder();
  }

  /**
   * Search Facebook posts using keywords
   */
  async searchPosts(
    sessionId: string,
    query: SearchQuery
  ): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      logger.info({ sessionId, query }, 'Starting post search');

      // Validate query
      const validation = this.queryBuilder.validateQuery(query);
      if (!validation.valid) {
        throw new Error(`Invalid search query: ${validation.errors.join(', ')}`);
      }

      // Optimize keywords
      const optimizedKeywords = this.queryBuilder.optimizeKeywords(query.keywords);
      logger.info({ optimizedKeywords }, 'Keywords optimized');

      // Get browser session
      const browserSession = await this.browserPool.getSession(sessionId);
      const { page } = browserSession;

      // Build search URL
      const searchUrl = this.queryBuilder.buildSearchUrl(optimizedKeywords);
      logger.info({ searchUrl }, 'Navigating to search');

      // Navigate to search results
      await page.goto(searchUrl, {
        waitUntil: 'networkidle',
        timeout: 60000,
      });

      // Wait for results to load
      await page.waitForSelector('[data-pagelet="FeedUnit"], [role="article"]', {
        timeout: 15000,
      }).catch(() => {
        logger.warn('No search results found');
      });

      // Random delay to mimic human behavior
      await this.randomDelay();

      // Extract post URLs
      const postUrls = await this.extractPostUrls(page);
      logger.info({ postCount: postUrls.length }, 'Extracted post URLs');

      // Filter by date
      const filteredPosts = await this.filterByDate(page, postUrls, query.dateFrom);
      logger.info({ filteredCount: filteredPosts.length }, 'Posts filtered by date');

      // Limit results
      const limitedPosts = filteredPosts.slice(0, query.maxResults);

      const result: SearchResult = {
        query,
        posts: limitedPosts.map(post => ({
          url: post.url,
          snippet: post.snippet,
          relevanceScore: this.calculateRelevance(post.snippet, query.keywords),
        })),
        totalFound: limitedPosts.length,
        searchedAt: new Date(),
      };

      logger.info(
        { duration: Date.now() - startTime, totalFound: result.totalFound },
        'Search completed'
      );

      return result;
    } catch (error) {
      logger.error({ sessionId, query, error }, 'Search failed');
      throw error;
    }
  }

  /**
   * Extract post URLs from search results page
   */
  private async extractPostUrls(page: any): Promise<Array<{ url: string; snippet: string }>> {
    try {
      const posts = await page.evaluate(() => {
        const postElements = document.querySelectorAll('[data-pagelet="FeedUnit"], [role="article"]');
        const results: Array<{ url: string; snippet: string }> = [];

        postElements.forEach((element) => {
          // Find post link
          const link = element.querySelector('a[href*="/posts/"], a[href*="/photos/"]');
          if (link && link.href) {
            // Extract text snippet
            const textElement = element.querySelector('[data-pagelet="PostText"]');
            const snippet = textElement?.textContent?.trim() || '';

            // Avoid duplicates
            if (!results.some(r => r.url === link.href)) {
              results.push({
                url: link.href,
                snippet: snippet.substring(0, 200),
              });
            }
          }
        });

        return results;
      });

      logger.info({ postCount: posts.length }, 'Extracted post URLs');
      return posts;
    } catch (error) {
      logger.error({ error }, 'Failed to extract post URLs');
      return [];
    }
  }

  /**
   * Filter posts by date
   */
  private async filterByDate(
    page: any,
    posts: Array<{ url: string; snippet: string }>,
    dateFrom: Date
  ): Promise<Array<{ url: string; snippet: string }>> {
    try {
      const filtered: Array<{ url: string; snippet: string }> = [];

      for (const post of posts) {
        try {
          // Navigate to post to check date
          await page.goto(post.url, {
            waitUntil: 'networkidle',
            timeout: 30000,
          });

          // Extract timestamp
          const timestamp = await page.evaluate(() => {
            const timeElement = document.querySelector('abbr[data-utime]');
            const utime = timeElement?.getAttribute('data-utime');
            return utime ? new Date(parseInt(utime) * 1000) : null;
          });

          // Keep post if it's within date range
          if (timestamp && timestamp >= dateFrom) {
            filtered.push(post);
          }

          // Random delay between checks
          await this.randomDelay();
        } catch (error) {
          logger.warn({ url: post.url, error }, 'Failed to check post date, skipping');
        }
      }

      return filtered;
    } catch (error) {
      logger.error({ error }, 'Date filtering failed');
      return posts; // Return all posts if filtering fails
    }
  }

  /**
   * Calculate relevance score based on keyword matches
   */
  private calculateRelevance(snippet: string, keywords: string[]): number {
    const snippetLower = snippet.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      if (snippetLower.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }

    // Normalize to 0-100
    return Math.min(100, score);
  }

  /**
   * Random delay to mimic human behavior
   */
  private async randomDelay(): Promise<void> {
    const delay = getRandomDelay();
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Search within specific liked pages
   */
  async searchInPages(
    sessionId: string,
    query: SearchQuery,
    pageNames: string[]
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const pageName of pageNames) {
      try {
        logger.info({ pageName }, 'Searching in page');
        
        const pageQuery = { ...query, pages: [pageName] };
        const result = await this.searchPosts(sessionId, pageQuery);
        results.push(result);

        // Delay between page searches
        await this.randomDelay();
      } catch (error) {
        logger.error({ pageName, error }, 'Search in page failed');
      }
    }

    return results;
  }

  /**
   * Get search statistics
   */
  getSearchStats(): {
    totalSearches: number;
    averageResults: number;
    lastSearchAt: Date | null;
  } {
    // This would be implemented with persistent storage
    return {
      totalSearches: 0,
      averageResults: 0,
      lastSearchAt: null,
    };
  }
}

// Factory function to create scraper instance
export function createPostSearchScraper(browserPool?: BrowserPool): PostSearchScraper {
  const pool = browserPool || new BrowserPool(3);
  return new PostSearchScraper(pool);
}
