import { chromium } from 'playwright';
import { addExtra } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import pino from 'pino';
import { BrowserSession, ScraperConfig } from '../types/scraper';
import { stealthConfig, getRandomUserAgent, getRandomViewport } from '../config/stealth-config';

const logger = pino();

// Initialize playwright-extra with stealth plugin
const playwright = addExtra(chromium);
playwright.use(stealth());

export class BrowserPool {
  private sessions: Map<string, BrowserSession> = new Map();
  private maxConcurrent: number;
  private defaultConfig: ScraperConfig;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
    this.defaultConfig = {
      headless: false, // Use headful for better stealth
      stealth: true,
      maxConcurrent,
      requestDelay: 3000,
      userAgent: getRandomUserAgent(),
      timeout: 60000,
    };
  }

  /**
   * Get or create a browser session
   */
  async getSession(sessionId: string, config?: Partial<ScraperConfig>): Promise<BrowserSession> {
    // Check if session exists
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      
      // Check if browser is still connected
      if (session.browser.isConnected()) {
        session.lastUsed = new Date();
        logger.info({ sessionId }, 'Reusing existing browser session');
        return session;
      } else {
        // Clean up disconnected session
        logger.warn({ sessionId }, 'Session disconnected, cleaning up');
        await this.closeSession(sessionId);
      }
    }

    // Check capacity
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.isActive);
    if (activeSessions.length >= this.maxConcurrent) {
      throw new Error(`Browser pool at capacity (${this.maxConcurrent} sessions)`);
    }

    // Create new session
    logger.info({ sessionId }, 'Creating new browser session');
    const session = await this.createBrowser(sessionId, { ...this.defaultConfig, ...config });
    this.sessions.set(sessionId, session);
    
    return session;
  }

  /**
   * Create a new browser instance
   */
  private async createBrowser(
    sessionId: string,
    config: ScraperConfig
  ): Promise<BrowserSession> {
    try {
      const browser = await playwright.launch({
        headless: config.headless,
        args: stealthConfig.launchArgs,
        timeout: config.timeout,
      });

      const viewport = getRandomViewport();
      const context = await browser.newContext({
        ...stealthConfig.contextOptions,
        viewport,
        userAgent: config.userAgent || getRandomUserAgent(),
      });

      const page = await context.newPage();

      // Set additional page options
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      });

      // Block unnecessary resources for faster loading
      await page.route('**/*', (route) => {
        const url = route.request().url();
        // Block images, fonts, and media for faster scraping
        if (/\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|mp4|webm)$/i.test(url)) {
          return route.abort();
        }
        return route.continue();
      });

      logger.info(
        { sessionId, viewport, userAgent: config.userAgent },
        'Browser session created successfully'
      );

      return {
        id: sessionId,
        browser,
        context,
        page,
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true,
      };
    } catch (error) {
      logger.error({ sessionId, error }, 'Failed to create browser session');
      throw error;
    }
  }

  /**
   * Close a specific session
   */
  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      try {
        logger.info({ sessionId }, 'Closing browser session');
        
        if (session.page) {
          await session.page.close().catch(() => {});
        }
        if (session.context) {
          await session.context.close().catch(() => {});
        }
        if (session.browser && session.browser.isConnected()) {
          await session.browser.close().catch(() => {});
        }

        session.isActive = false;
        this.sessions.delete(sessionId);
        
        logger.info({ sessionId }, 'Browser session closed');
      } catch (error) {
        logger.error({ sessionId, error }, 'Error closing browser session');
      }
    }
  }

  /**
   * Close all sessions
   */
  async closeAll(): Promise<void> {
    logger.info({ count: this.sessions.size }, 'Closing all browser sessions');
    
    const closePromises = Array.from(this.sessions.keys()).map(sessionId =>
      this.closeSession(sessionId)
    );
    
    await Promise.allSettled(closePromises);
    logger.info('All browser sessions closed');
  }

  /**
   * Get session statistics
   */
  getStats() {
    const sessions = Array.from(this.sessions.values());
    const active = sessions.filter(s => s.isActive).length;
    const disconnected = sessions.filter(s => !s.browser.isConnected()).length;

    return {
      total: sessions.length,
      active,
      disconnected,
      available: this.maxConcurrent - active,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Get all session IDs
   */
  getSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }

  /**
   * Clean up old inactive sessions
   */
  async cleanup(maxAge: number = 30 * 60 * 1000): Promise<void> {
    const now = Date.now();
    const sessionsToClean = Array.from(this.sessions.entries()).filter(
      ([, session]) => now - session.lastUsed.getTime() > maxAge
    );

    for (const [sessionId] of sessionsToClean) {
      logger.info({ sessionId, maxAge }, 'Cleaning up old session');
      await this.closeSession(sessionId);
    }

    logger.info({ cleaned: sessionsToClean.length }, 'Session cleanup complete');
  }
}

// Export singleton instance
export const browserPool = new BrowserPool(3);
