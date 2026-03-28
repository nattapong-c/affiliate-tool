import pino from 'pino';
import { BrowserPool } from '../scrapers/browser-pool';
import { SessionManager } from '../utils/session-manager';
import { ScrapedPost, ScraperStats, FacebookSession } from '../types/scraper';
import { getRandomDelay } from '../config/stealth-config';

const logger = pino();

export class FacebookScraper {
  private browserPool: BrowserPool;
  private sessionManager: SessionManager;
  private stats: ScraperStats;

  constructor(browserPool: BrowserPool, sessionManager: SessionManager) {
    this.browserPool = browserPool;
    this.sessionManager = sessionManager;
    this.stats = {
      totalScraped: 0,
      successfulScrapes: 0,
      failedScrapes: 0,
      averageResponseTime: 0,
      lastScrapeAt: null,
    };
  }

  /**
   * Navigate to Facebook and apply session cookies
   */
  async navigateToFacebook(sessionId: string): Promise<void> {
    const session = await this.sessionManager.getSession(sessionId);
    
    if (!session) {
      throw new Error(`Session not found for user: ${sessionId}`);
    }

    const browserSession = await this.browserPool.getSession(sessionId);
    const { page, context } = browserSession;

    try {
      logger.info({ sessionId }, 'Navigating to Facebook');

      // Set cookies
      await context.addCookies(session.cookies);
      
      // Navigate to Facebook
      await page.goto('https://www.facebook.com', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });

      // Wait for page to load
      await page.waitForSelector('[id="mount_0_0"]', { timeout: 10000 }).catch(() => {
        logger.warn({ sessionId }, 'Facebook main selector not found, may be logged out');
      });

      // Random delay to mimic human behavior
      await this.randomDelay();

      logger.info({ sessionId }, 'Successfully navigated to Facebook');
    } catch (error) {
      logger.error({ sessionId, error }, 'Failed to navigate to Facebook');
      throw error;
    }
  }

  /**
   * Check if session is still valid
   */
  async checkSessionValidity(sessionId: string): Promise<boolean> {
    try {
      const browserSession = await this.browserPool.getSession(sessionId);
      const { page } = browserSession;

      // Navigate to a Facebook page
      await page.goto('https://www.facebook.com/feed', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Check if we're redirected to login
      const currentUrl = page.url();
      const isLoggedIn = !currentUrl.includes('/login') && !currentUrl.includes('/checkpoint');

      logger.info({ sessionId, isLoggedIn }, 'Session validity check complete');
      
      return isLoggedIn;
    } catch (error) {
      logger.error({ sessionId, error }, 'Session validity check failed');
      return false;
    }
  }

  /**
   * Scrape a single post by URL
   */
  async scrapePost(sessionId: string, postUrl: string): Promise<ScrapedPost | null> {
    const startTime = Date.now();

    try {
      const browserSession = await this.browserPool.getSession(sessionId);
      const { page } = browserSession;

      logger.info({ sessionId, postUrl }, 'Scraping post');

      // Navigate to post
      await page.goto(postUrl, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for post content
      await page.waitForSelector('[data-pagelet="PostText"]', { timeout: 10000 }).catch(() => {
        logger.warn({ postUrl }, 'Post content not found');
      });

      // Extract post content
      const content = await page.evaluate(() => {
        const postElement = document.querySelector('[data-pagelet="PostText"]');
        return postElement?.textContent?.trim() || '';
      });

      // Extract author info
      const author = await page.evaluate(() => {
        const authorElement = document.querySelector('[data-pagelet="PageHeader"] a') as HTMLAnchorElement | null;
        return {
          name: authorElement?.textContent?.trim() || 'Unknown',
          profileUrl: authorElement?.href || '',
        };
      });

      // Extract timestamp
      const timestamp = await page.evaluate(() => {
        const timeElement = document.querySelector('abbr[data-utime]');
        const utime = timeElement?.getAttribute('data-utime');
        return utime ? new Date(parseInt(utime) * 1000) : new Date();
      });

      // Extract engagement metrics
      const engagement = await this.extractEngagementMetrics(page);

      // Extract images
      const images = await page.evaluate(() => {
        const imgElements = document.querySelectorAll('img[alt=""]');
        return Array.from(imgElements)
          .map(img => (img as HTMLImageElement).getAttribute('src'))
          .filter(Boolean) as string[];
      });

      const scrapedPost: ScrapedPost = {
        id: this.generatePostId(postUrl),
        url: postUrl,
        postId: this.generatePostId(postUrl),
        content: content || 'No content',
        author,
        timestamp,
        engagement,
        reactions: { like: engagement.likes, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
        engagementDensity: this.calculateEngagementDensity(engagement, timestamp),
        images,
        videos: [],
        keywords: [],
        scrapedAt: new Date(),
        status: 'new'
        };


      // Update stats
      this.stats.totalScraped++;
      this.stats.successfulScrapes++;
      this.stats.lastScrapeAt = new Date();
      this.updateAverageResponseTime(Date.now() - startTime);

      logger.info(
        { sessionId, postId: scrapedPost.id, duration: Date.now() - startTime },
        'Post scraped successfully'
      );

      // Random delay after scraping
      await this.randomDelay();

      return scrapedPost;
    } catch (error) {
      this.stats.failedScrapes++;
      logger.error({ sessionId, postUrl, error }, 'Failed to scrape post');
      return null;
    }
  }

  /**
   * Extract engagement metrics from post page
   */
  private async extractEngagementMetrics(page: any) {
    try {
      const metrics = await page.evaluate(() => {
        // Find engagement elements
        const likeElements = document.querySelectorAll('[aria-label*="Like"]');
        const commentElements = document.querySelectorAll('[aria-label*="Comment"]');
        const shareElements = document.querySelectorAll('[aria-label*="Share"]');

        const parseCount = (text?: string): number => {
          if (!text) return 0;
          const match = text.match(/([\d,.]+[KMB]?)/i);
          if (!match) return 0;
          
          const numStr = match[1].toLowerCase();
          const multiplier = numStr.includes('k') ? 1000 : numStr.includes('m') ? 1000000 : numStr.includes('b') ? 1000000000 : 1;
          const num = parseFloat(numStr.replace(/[kmb]/i, '').replace(/,/g, ''));
          
          return Math.round(num * multiplier);
        };

        return {
          likes: parseCount(likeElements[0]?.textContent),
          comments: parseCount(commentElements[0]?.textContent),
          shares: parseCount(shareElements[0]?.textContent),
          total: 0,
        };
      });

      metrics.total = metrics.likes + metrics.comments + metrics.shares;
      return metrics;
    } catch (error) {
      logger.error({ error }, 'Failed to extract engagement metrics');
      return { likes: 0, comments: 0, shares: 0, total: 0 };
    }
  }

  /**
   * Calculate engagement density score
   */
  private calculateEngagementDensity(
    engagement: { likes: number; comments: number; shares: number; total: number },
    timestamp: Date
  ): number {
    const ageInHours = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
    const normalizedAge = Math.max(ageInHours, 1); // Avoid division by zero
    
    // Weighted engagement: shares > comments > likes
    const weightedEngagement = engagement.likes + (engagement.comments * 2) + (engagement.shares * 3);
    
    return weightedEngagement / normalizedAge;
  }

  /**
   * Generate a unique post ID from URL
   */
  private generatePostId(url: string): string {
    const urlParts = url.split('/');
    const postId = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    return postId.replace(/\D/g, '').substring(0, 20) || Date.now().toString();
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(duration: number) {
    const total = this.stats.successfulScrapes + this.stats.failedScrapes;
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (total - 1) + duration) / total;
  }

  /**
   * Random delay to mimic human behavior
   */
  private async randomDelay(): Promise<void> {
    const delay = getRandomDelay();
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Get scraper statistics
   */
  getStats(): ScraperStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalScraped: 0,
      successfulScrapes: 0,
      failedScrapes: 0,
      averageResponseTime: 0,
      lastScrapeAt: null,
    };
  }

  /**
   * Close all browser sessions
   */
  async close(): Promise<void> {
    await this.browserPool.closeAll();
    logger.info('Facebook scraper closed');
  }
}

// Factory function to create scraper instance
export function createFacebookScraper(
  browserPool?: BrowserPool,
  sessionManager?: SessionManager
): FacebookScraper {
  const pool = browserPool || new BrowserPool(3);
  const manager = sessionManager || new SessionManager();
  return new FacebookScraper(pool, manager);
}
