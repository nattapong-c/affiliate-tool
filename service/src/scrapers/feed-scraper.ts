import pino from 'pino';
import { BrowserPool } from './browser-pool';
import { ScrapedPostModel } from '../models/scraped-post';

const logger = pino();

export interface FeedScrapeOptions {
  scrollCount?: number;
  minLikes?: number;
  minComments?: number;
  minShares?: number;
  maxPosts?: number;
}

export interface FeedPost {
  url: string;
  content: string;
  author: string;
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
  scrapedAt: Date;
}

export class FeedScraper {
  private browserPool: BrowserPool;

  constructor(browserPool: BrowserPool) {
    this.browserPool = browserPool;
  }

  /**
   * Scrape posts from Facebook feed (homepage timeline)
   */
  async scrapeFeed(
    sessionId: string,
    options: FeedScrapeOptions = {}
  ): Promise<FeedPost[]> {
    const startTime = Date.now();
    
    try {
      logger.info({ sessionId, options }, 'Starting feed scrape');

      const browserSession = await this.browserPool.getSession(sessionId);
      const { page } = browserSession;

      // Navigate to Facebook homepage (feed)
      logger.info('Navigating to Facebook feed');
      await page.goto('https://www.facebook.com/', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });

      // Wait for page to load
      await page.waitForTimeout(3000);

      // Check if logged in
      const currentUrl = page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/checkpoint')) {
        logger.error({ currentUrl }, 'Not logged in to Facebook');
        throw new Error('Facebook login required. Please log in manually in the browser.');
      }

      // Wait for feed to load
      const hasFeed = await page.waitForSelector('[data-pagelet="FeedUnit"], [role="article"]', {
        timeout: 15000,
      }).catch(() => null);

      if (!hasFeed) {
        logger.warn('No feed content found');
        return [];
      }

      // Scroll to load more posts
      const scrollCount = options.scrollCount || 3;
      logger.info({ scrollCount }, 'Scrolling to load posts');
      await this.scrollAndLoad(page, scrollCount);

      // Extract posts
      logger.info('Extracting posts from feed');
      const posts = await this.extractFeedPosts(page);
      logger.info({ postCount: posts.length, posts: posts.map(p => ({ url: p.url, content: p.content.substring(0, 50) })) }, 'Posts extracted');

      // Filter by engagement
      const filteredPosts = this.filterByEngagement(posts, options);
      logger.info({ filteredCount: filteredPosts.length, totalCount: posts.length }, 'Posts after filtering');

      // Limit results
      const maxPosts = options.maxPosts || 50;
      const limitedPosts = filteredPosts.slice(0, maxPosts);

      const duration = Date.now() - startTime;
      logger.info({ duration, scrapedCount: limitedPosts.length }, 'Feed scrape completed');

      return limitedPosts;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ sessionId, errorMessage }, 'Feed scrape failed');
      throw error;
    }
  }

  /**
   * Scroll and load more posts
   */
  private async scrollAndLoad(page: any, scrollCount: number) {
    for (let i = 0; i < scrollCount; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await page.waitForTimeout(2000); // Wait for content to load
    }
    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }

  /**
   * Extract posts from feed
   */
  private async extractFeedPosts(page: any): Promise<FeedPost[]> {
    return await page.evaluate(() => {
      // Multiple selector strategies for Facebook feed posts
      const selectors = [
        'div[role="article"]',  // Standard post
        'div[data-pagelet="FeedUnit"]',  // Feed unit
        'div.x1yztbdb.x1n2onr6.x14vt4th',  // Facebook class-based (changes frequently)
        'article',  // HTML5 article tag
        'div[data-visualcompletion="css-v"]',  // Visual completion marker
      ];

      let postElements: Element[] = [];
      
      // Try each selector until we find posts
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          postElements = Array.from(elements);
          break;
        }
      }
      
      // Fallback: look for posts by structure
      if (postElements.length === 0) {
        // Try to find divs that contain typical post structure
        const allDivs = document.querySelectorAll('div');
        postElements = (Array.from(allDivs) as HTMLElement[]).filter(div => {
          const text = div.textContent || '';
          // Look for divs with substantial content and engagement buttons
          return text.length > 100 && 
                 (div.querySelector('[aria-label*="Like"]') || 
                  div.querySelector('[aria-label*="Comment"]') ||
                  div.querySelector('[aria-label*="Share"]'));
        }).slice(0, 20);
      }

      const posts: FeedPost[] = [];

      postElements.forEach((el) => {
        try {
          // Extract content - try multiple strategies
          let content = '';
          const contentEl = el.querySelector('[data-pagelet="PostText"]') ||
                           el.querySelector('[role="article"] p') ||
                           el.querySelector('div[dir="auto"]') ||
                           el.querySelector('span:not([aria-hidden])');
          content = contentEl?.textContent?.trim() || '';

          // Skip empty or very short posts
          if (!content || content.length < 10) return;

          // Extract author - improved strategy
          let author = 'Unknown';
          const authorEl = (el.querySelector('[data-pagelet="PostHeader"] h2 a') ||
                          el.querySelector('[data-pagelet="PostHeader"] h3 a') ||
                          el.querySelector('h2 span a[role="link"]') ||
                          el.querySelector('[data-pagelet="PageHeader"] a') ||
                          el.querySelector('[data-pagelet="PostHeader"] a') ||
                          el.querySelector('a[href*="/profile"]') ||
                          el.querySelector('strong')) as HTMLAnchorElement | null;
          author = authorEl?.textContent?.trim() || 'Unknown';

          // Extract timestamp
          const timeEl = (el.querySelector('abbr[data-utime]') ||
                        el.querySelector('time') ||
                        el.querySelector('[data-tooltip-content="true"]')) as HTMLElement | null;
          const timestamp = timeEl?.getAttribute('data-utime') || 
                           timeEl?.getAttribute('datetime');

          // Extract engagement metrics - revised robust strategy
          const parseEngagementCount = (text: string | null | undefined): number => {
            if (!text) return 0;
            const cleanText = text.trim();
            if (!cleanText) return 0;
            
            // Extract numeric part and suffix (supports K, M, B, พัน, ล้าน)
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
          const reactionEl = (el.querySelector('[aria-label*="reacted" i]') || 
                            el.querySelector('[aria-label*="ถูกใจ" i]') ||
                            el.querySelector('[aria-label*="See who reacted" i]')) as HTMLElement | null;
          
          let likes = 0;
          const reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
          
          if (reactionEl) {
            const label = reactionEl.getAttribute('aria-label') || '';
            // Handle "Liked by X and 1.2K others"
            const othersMatch = label.match(/and ([\d,.]+[KMBพันล้าน]*) others/i) || 
                               label.match(/และคนอื่นๆ อีก ([\d,.]+[KMBพันล้าน]*)/i);
            if (othersMatch) {
              likes = parseEngagementCount(othersMatch[1]) + 1;
            } else {
              likes = parseEngagementCount(label);
            }

            // Extract breakdown from aria-label if possible (Facebook sometimes includes it)
            // Example: "See who reacted to this: 1.2K (Like: 1K, Love: 200)"
            const breakdownMatch = label.match(/\((.*?)\)/);
            if (breakdownMatch) {
              const items = breakdownMatch[1].split(',');
              items.forEach((item: string) => {
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
              // Fallback: If no breakdown, set all likes to the 'like' type
              reactions.like = likes;
            }
          }

          // 2. Extract Comments
          // Look for comment count in the summary row or buttons
          const commentEl = (el.querySelector('[aria-label*="Comment" i]:not([role="button"])') || 
                            el.querySelector('[aria-label*="ความคิดเห็น" i]:not([role="button"])') ||
                            Array.from(el.querySelectorAll('span, a')).find(node => 
                              /^\d+.*(comment|ความคิดเห็น)/i.test(node.textContent || '')
                            ) ||
                            Array.from(el.querySelectorAll('[aria-label*="Comment" i], [aria-label*="ความคิดเห็น" i]')).pop()) as HTMLElement | undefined;
          
          let comments = 0;
          if (commentEl) {
            const label = commentEl.getAttribute('aria-label') || '';
            const text = commentEl.textContent || '';
            comments = parseEngagementCount(label) || parseEngagementCount(text);
          }

          // 3. Extract Shares
          // Look for share count
          const shareEl = (el.querySelector('[aria-label*="Share" i]:not([role="button"])') || 
                          el.querySelector('[aria-label*="แชร์" i]:not([role="button"])') ||
                          Array.from(el.querySelectorAll('span, a')).find(node => 
                            /^\d+.*(share|แชร์)/i.test(node.textContent || '')
                          ) ||
                          Array.from(el.querySelectorAll('[aria-label*="Share" i], [aria-label*="แชร์" i]')).pop()) as HTMLElement | undefined;
          
          let shares = 0;
          if (shareEl) {
            const label = shareEl.getAttribute('aria-label') || '';
            const text = shareEl.textContent || '';
            shares = parseEngagementCount(label) || parseEngagementCount(text);
          }

          // Extract post URL
          const linkEl = (el.querySelector('a[href*="/posts/"]') ||
                        el.querySelector('a[href*="/photos/"]') ||
                        el.querySelector('a[href*="/permalink.php"]') ||
                        el.querySelector('a[href*="fbid="]')) as HTMLAnchorElement | null;
          const url = linkEl?.href || '';

          // Only add if we have meaningful content and a valid URL
          if (content && content.length > 20 && url) {
            posts.push({
              url,
              content,
              author,
              timestamp: timestamp ? new Date(parseInt(timestamp) * 1000) : new Date(),
              engagement: {
                likes,
                comments,
                shares,
                total: likes + comments + shares,
              },
              reactions,
              scrapedAt: new Date(),
            });
          }
        } catch (error) {
          console.error('Error extracting post:', error);
        }
      });

      return posts;
    });
  }

  /**
   * Filter posts by engagement thresholds
   */
  private filterByEngagement(posts: FeedPost[], options: FeedScrapeOptions): FeedPost[] {
    const minLikes = options.minLikes || 0;
    const minComments = options.minComments || 0;
    const minShares = options.minShares || 0;

    return posts.filter(post =>
      post.engagement.likes >= minLikes &&
      post.engagement.comments >= minComments &&
      post.engagement.shares >= minShares
    );
  }

  /**
   * Save scraped posts to database
   */
  async savePosts(posts: FeedPost[]): Promise<number> {
    let savedCount = 0;

    for (const post of posts) {
      if (!post.url) {
        logger.warn({ author: post.author }, 'Skipping post with empty URL');
        continue;
      }
      try {
        await ScrapedPostModel.findOneAndUpdate(
          { url: post.url },
          {
            url: post.url,
            postId: this.generatePostId(post.url),
            content: post.content,
            author: { name: post.author, profileUrl: '' },
            timestamp: post.timestamp,
            engagement: post.engagement,
            reactions: post.reactions,
            engagementDensity: post.engagement.total,
            images: [],
            videos: [],
            keywords: [],
            status: 'new',
            scrapedAt: post.scrapedAt,
          },
          { upsert: true }
        );
        savedCount++;
      } catch (error) {
        logger.error({ url: post.url, error }, 'Failed to save post');
      }
    }

    logger.info({ savedCount }, 'Posts saved to database');
    return savedCount;
  }

  /**
   * Generate post ID from URL
   */
  private generatePostId(url: string): string {
    const urlParts = url.split('/');
    const postId = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    return postId.replace(/\D/g, '').substring(0, 20) || Date.now().toString();
  }
}

// Factory function
export function createFeedScraper(browserPool?: BrowserPool): FeedScraper {
  const pool = browserPool || new BrowserPool(1);
  return new FeedScraper(pool);
}
