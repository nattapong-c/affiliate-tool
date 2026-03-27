import pino from 'pino';
import { BrowserPool } from '../scrapers/browser-pool';
import { ScrapedPostModel } from '../models/scraped-post';
import { engagementCalculator } from '../utils/engagement-calculator';
import { getRandomDelay } from '../config/stealth-config';

const logger = pino();

export interface PostDetail {
  url: string;
  postId: string;
  content: string;
  author: {
    name: string;
    profileUrl: string;
  };
  timestamp: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    total: number;
  };
  images: string[];
  videos: string[];
}

export class PostDetailScraper {
  private browserPool: BrowserPool;

  constructor(browserPool: BrowserPool) {
    this.browserPool = browserPool;
  }

  /**
   * Scrape detailed post information from URL
   */
  async scrapePostDetail(sessionId: string, url: string): Promise<PostDetail | null> {
    try {
      logger.info({ sessionId, url }, 'Scraping post detail');

      const browserSession = await this.browserPool.getSession(sessionId);
      const { page } = browserSession;

      // Navigate to post
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for post content
      await page.waitForSelector('[data-pagelet="PostText"], [role="article"]', {
        timeout: 10000,
      }).catch(() => {
        logger.warn({ url }, 'Post content not found');
      });

      // Extract post content
      const content = await this.extractContent(page);

      // Extract author info
      const author = await this.extractAuthor(page);

      // Extract timestamp
      const timestamp = await this.extractTimestamp(page);

      // Extract engagement metrics
      const engagement = await this.extractEngagementMetrics(page);

      // Extract images
      const images = await this.extractImages(page);

      // Extract videos
      const videos = await this.extractVideos(page);

      // Random delay
      await this.randomDelay();

      const postDetail: PostDetail = {
        url,
        postId: this.generatePostId(url),
        content: content || 'No content',
        author,
        timestamp,
        engagement,
        images,
        videos,
      };

      logger.info(
        { postId: postDetail.postId, engagement },
        'Post detail scraped successfully'
      );

      return postDetail;
    } catch (error) {
      logger.error({ sessionId, url, error }, 'Failed to scrape post detail');
      return null;
    }
  }

  /**
   * Extract post content
   */
  private async extractContent(page: any): Promise<string> {
    try {
      const content = await page.evaluate(() => {
        const postElement = document.querySelector('[data-pagelet="PostText"]');
        if (postElement) {
          return postElement.textContent?.trim() || '';
        }
        
        // Fallback selectors
        const articleElement = document.querySelector('[role="article"]');
        return articleElement?.textContent?.trim() || '';
      });

      return content;
    } catch (error) {
      logger.error({ error }, 'Failed to extract content');
      return '';
    }
  }

  /**
   * Extract author information
   */
  private async extractAuthor(page: any): Promise<{ name: string; profileUrl: string }> {
    try {
      const author = await page.evaluate(() => {
        const authorElement = document.querySelector(
          '[data-pagelet="PageHeader"] a, [data-pagelet="PostHeader"] a'
        );
        
        if (authorElement) {
          return {
            name: authorElement.textContent?.trim() || 'Unknown',
            profileUrl: authorElement.getAttribute('href') || '',
          };
        }
        
        return { name: 'Unknown', profileUrl: '' };
      });

      return author;
    } catch (error) {
      logger.error({ error }, 'Failed to extract author');
      return { name: 'Unknown', profileUrl: '' };
    }
  }

  /**
   * Extract post timestamp
   */
  private async extractTimestamp(page: any): Promise<Date> {
    try {
      const timestamp = await page.evaluate(() => {
        // Try data-utime attribute (Unix timestamp)
        const timeElement = document.querySelector('abbr[data-utime]');
        const utime = timeElement?.getAttribute('data-utime');
        
        if (utime) {
          return new Date(parseInt(utime) * 1000);
        }
        
        // Fallback to current date
        return new Date();
      });

      return timestamp;
    } catch (error) {
      logger.error({ error }, 'Failed to extract timestamp');
      return new Date();
    }
  }

  /**
   * Extract engagement metrics
   */
  private async extractEngagementMetrics(page: any): Promise<{
    likes: number;
    comments: number;
    shares: number;
    total: number;
  }> {
    try {
      const metrics = await page.evaluate(() => {
        const parseCount = (text?: string): number => {
          if (!text) return 0;
          
          // Handle abbreviated numbers (1K, 1M, etc.)
          const match = text.match(/([\d,.]+[KMB]?)$/i);
          if (!match) return 0;
          
          const numStr = match[1].toLowerCase();
          const multiplier = 
            numStr.includes('k') ? 1000 : 
            numStr.includes('m') ? 1000000 : 
            numStr.includes('b') ? 1000000000 : 1;
          
          const num = parseFloat(numStr.replace(/[kmb]/i, '').replace(/,/g, ''));
          return Math.round(num * multiplier);
        };

        // Find engagement elements with aria-labels
        const likeElements = document.querySelectorAll('[aria-label*="Like"]');
        const commentElements = document.querySelectorAll('[aria-label*="Comment"]');
        const shareElements = document.querySelectorAll('[aria-label*="Share"]');

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
   * Extract images from post
   */
  private async extractImages(page: any): Promise<string[]> {
    try {
      const images = await page.evaluate(() => {
        const imgElements = document.querySelectorAll('img[alt=""]');
        return Array.from(imgElements)
          .map(img => img.getAttribute('src'))
          .filter(Boolean) as string[];
      });

      return images;
    } catch (error) {
      logger.error({ error }, 'Failed to extract images');
      return [];
    }
  }

  /**
   * Extract videos from post
   */
  private async extractVideos(page: any): Promise<string[]> {
    try {
      const videos = await page.evaluate(() => {
        const videoElements = document.querySelectorAll('video[src]');
        return Array.from(videoElements)
          .map(video => video.getAttribute('src'))
          .filter(Boolean) as string[];
      });

      return videos;
    } catch (error) {
      logger.error({ error }, 'Failed to extract videos');
      return [];
    }
  }

  /**
   * Save scraped post to database
   */
  async savePost(
    postDetail: PostDetail,
    keywords: string[] = [],
    language: 'en' | 'th' = 'en'
  ): Promise<boolean> {
    try {
      // Calculate engagement density
      const engagementAnalysis = engagementCalculator.analyze(
        postDetail.engagement,
        postDetail.timestamp
      );

      // Check if post already exists
      const existing = await ScrapedPostModel.findOne({ url: postDetail.url });
      
      if (existing) {
        // Update existing post
        await ScrapedPostModel.findByIdAndUpdate(existing._id, {
          content: postDetail.content,
          engagement: postDetail.engagement,
          engagementDensity: engagementAnalysis.density,
          keywords,
          scrapedAt: new Date(),
        });
        
        logger.info({ postId: postDetail.postId }, 'Post updated');
      } else {
        // Create new post
        await ScrapedPostModel.create({
          url: postDetail.url,
          postId: postDetail.postId,
          content: postDetail.content,
          author: postDetail.author,
          timestamp: postDetail.timestamp,
          engagement: postDetail.engagement,
          engagementDensity: engagementAnalysis.density,
          images: postDetail.images,
          videos: postDetail.videos,
          keywords,
          language,
          status: 'new',
        });
        
        logger.info({ postId: postDetail.postId }, 'Post saved');
      }

      return true;
    } catch (error) {
      logger.error({ error }, 'Failed to save post');
      return false;
    }
  }

  /**
   * Scrape and save multiple posts
   */
  async scrapeAndSavePosts(
    sessionId: string,
    urls: string[],
    keywords: string[] = [],
    language: 'en' | 'th' = 'en'
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const url of urls) {
      try {
        const postDetail = await this.scrapePostDetail(sessionId, url);
        
        if (postDetail) {
          const saved = await this.savePost(postDetail, keywords, language);
          if (saved) {
            success++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }

        // Delay between scrapes
        await this.randomDelay();
      } catch (error) {
        logger.error({ url, error }, 'Failed to scrape post');
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Generate post ID from URL
   */
  private generatePostId(url: string): string {
    const urlParts = url.split('/');
    const postId = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    return postId.replace(/\D/g, '').substring(0, 20) || Date.now().toString();
  }

  /**
   * Random delay
   */
  private async randomDelay(): Promise<void> {
    const delay = getRandomDelay();
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Factory function
export function createPostDetailScraper(browserPool?: BrowserPool): PostDetailScraper {
  const pool = browserPool || new BrowserPool(3);
  return new PostDetailScraper(pool);
}
