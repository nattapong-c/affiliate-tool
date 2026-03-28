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
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
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
      const engagementResult = await this.extractEngagementMetrics(page);

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
        engagement: {
          likes: engagementResult.likes,
          comments: engagementResult.comments,
          shares: engagementResult.shares,
          total: engagementResult.total,
        },
        reactions: engagementResult.reactions,
        images,
        videos,
      };

      logger.info(
        { postId: postDetail.postId, engagement: postDetail.engagement },
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
        const authorElement = (document.querySelector('h2 span a[role="link"]') ||
                              document.querySelector('h3 span a[role="link"]') ||
                              document.querySelector('h2 a[role="link"]') ||
                              document.querySelector('h3 a[role="link"]') ||
                              document.querySelector('[data-pagelet="PageHeader"] a') ||
                              document.querySelector('[data-pagelet="PostHeader"] a') ||
                              document.querySelector('a[data-hovercard*="user.php"]') ||
                              document.querySelector('a[data-hovercard*="page.php"]') ||
                              document.querySelector('strong a') ||
                              document.querySelector('span[dir="auto"] strong')) as HTMLAnchorElement | null;
        
        if (authorElement) {
          return {
            name: authorElement.textContent?.trim() || 'Unknown',
            profileUrl: authorElement.getAttribute('href') || '',
          };
        }
        
        // Fallback
        const links = Array.from(document.querySelectorAll('a[role="link"]'));
        for (const link of links) {
          const text = link.textContent?.trim() || '';
          if (text.length > 2 && text.length < 50 && !/^\d+$/.test(text)) {
            return {
              name: text,
              profileUrl: link.getAttribute('href') || '',
            };
          }
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
    reactions: {
      like: number;
      love: number;
      haha: number;
      wow: number;
      sad: number;
      angry: number;
    };
  }> {
    try {
      const metrics = await page.evaluate(() => {
        const parseEngagementCount = (text: string | null | undefined): number => {
          if (!text) return 0;
          const cleanText = text.trim();
          if (!cleanText) return 0;
          
          const match = cleanText.match(/([\d,.]+\s?[KMBพันล้าน]*)/i);
          if (!match) return 0;
          
          let valStr = match[1].replace(/,/g, '').toUpperCase().replace(/\s+/g, '');
          let multiplier = 1;
          
          if (valStr.includes('K') || valStr.includes('พัน')) {
            multiplier = 1000;
            valStr = valStr.replace(/[Kพัน]/g, '');
          } else if (valStr.includes('M') || valStr.includes('ล้าน')) {
            multiplier = 1000000;
            valStr = valStr.replace(/[Mล้าน]/g, '');
          } else if (valStr.includes('B')) {
            multiplier = 1000000000;
            valStr = valStr.replace(/[B]/g, '');
          }
          
          const base = parseFloat(valStr);
          return isNaN(base) ? 0 : Math.round(base * multiplier);
        };

        // 1. Extract Likes/Reactions
        const reactionEl = document.querySelector('[aria-label*="reacted" i]') || 
                          document.querySelector('[aria-label*="ถูกใจ" i]') ||
                          document.querySelector('[aria-label*="See who reacted" i]');
        
        let likes = 0;
        const reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
        
        if (reactionEl) {
          const label = reactionEl.getAttribute('aria-label') || '';
          const othersMatch = label.match(/and ([\d,.]+[KMBพันล้าน]*) others/i) || 
                             label.match(/และคนอื่นๆ อีก ([\d,.]+[KMBพันล้าน]*)/i);
          if (othersMatch) {
            likes = parseEngagementCount(othersMatch[1]) + 1;
          } else {
            likes = parseEngagementCount(label);
          }

          // Extract breakdown from aria-label
          const breakdownMatch = label.match(/\((.*?)\)/);
          if (breakdownMatch) {
            const items = breakdownMatch[1].split(',');
            items.forEach(item => {
              const parts = item.split(':');
              if (parts.length === 2) {
                const type = parts[0].trim().toLowerCase();
                const count = parseEngagementCount(parts[1]);
                if (type.includes('like') || type.includes('ถูกใจ')) reactions.like = count;
                else if (type.includes('love') || type.includes('รัก')) reactions.love = count;
                else if (type.includes('haha') || type.includes('ฮ่าฮ่า')) reactions.haha = count;
                else if (type.includes('wow') || type.includes('ว้าว')) reactions.wow = count;
                else if (type.includes('sad') || type.includes('เศร้า')) reactions.sad = count;
                else if (type.includes('angry') || type.includes('โกรธ')) reactions.angry = count;
              }
            });
          } else {
            reactions.like = likes;
          }
        }

        // 2. Extract Comments
        const commentEl = (document.querySelector('[aria-label*="Comment" i]:not([role="button"])') || 
                          document.querySelector('[aria-label*="ความคิดเห็น" i]:not([role="button"])') ||
                          Array.from(document.querySelectorAll('span, a')).find(node => 
                            /^\d+.*(comment|ความคิดเห็น)/i.test(node.textContent || '')
                          ) ||
                          Array.from(document.querySelectorAll('[aria-label*="Comment" i], [aria-label*="ความคิดเห็น" i]')).pop()) as HTMLElement | undefined;
        
        let comments = 0;
        if (commentEl) {
          const label = commentEl.getAttribute('aria-label') || '';
          const text = commentEl.textContent || '';
          comments = parseEngagementCount(label) || parseEngagementCount(text);
        }

        // 3. Extract Shares
        const shareEl = (document.querySelector('[aria-label*="Share" i]:not([role="button"])') || 
                        document.querySelector('[aria-label*="แชร์" i]:not([role="button"])') ||
                        Array.from(document.querySelectorAll('span, a')).find(node => 
                          /^\d+.*(share|แชร์)/i.test(node.textContent || '')
                        ) ||
                        Array.from(document.querySelectorAll('[aria-label*="Share" i], [aria-label*="แชร์" i]')).pop()) as HTMLElement | undefined;
        
        let shares = 0;
        if (shareEl) {
          const label = shareEl.getAttribute('aria-label') || '';
          const text = shareEl.textContent || '';
          shares = parseEngagementCount(label) || parseEngagementCount(text);
        }

        return {
          likes,
          comments,
          shares,
          total: likes + comments + shares,
          reactions
        };
      });

      return metrics;
    } catch (error) {
      logger.error({ error }, 'Failed to extract engagement metrics');
      return { 
        likes: 0, 
        comments: 0, 
        shares: 0, 
        total: 0,
        reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 }
      };
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
    keywords: string[] = []
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
          reactions: postDetail.reactions,
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
          reactions: postDetail.reactions,
          engagementDensity: engagementAnalysis.density,
          images: postDetail.images,
          videos: postDetail.videos,
          keywords,
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
    keywords: string[] = []
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const url of urls) {
      try {
        const postDetail = await this.scrapePostDetail(sessionId, url);
        
        if (postDetail) {
          const saved = await this.savePost(postDetail, keywords);
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
