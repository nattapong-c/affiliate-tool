# Task 008: Phase 2 - Post Scout Setup & Configuration

## Overview
Set up the foundational infrastructure for Facebook post scraping including Playwright configuration, stealth plugins, and session management.

## Type
- [x] Backend
- [ ] Frontend
- [ ] Database
- [x] Integration
- [ ] Testing
- [x] Documentation

## Priority
- [x] Critical (P0)
- [ ] High (P1)
- [ ] Medium (P2)
- [ ] Low (P3)

## Dependencies
- [x] Depends on: Task 001 (Project Setup)
- [x] Blocks: Task 009, Task 010, Task 011

## Requirements

### Functional Requirements
1. Install Playwright with browser binaries
2. Configure playwright-extra with stealth plugin
3. Set up Facebook session cookie management
4. Create browser pool for concurrent scraping
5. Implement rate limiting to avoid detection

### Technical Requirements
1. Use Bun runtime with Playwright
2. Implement puppeteer-extra-plugin-stealth
3. Store session cookies securely (encrypted)
4. Support headful and headless modes
5. Configure user-agent rotation
6. Implement request interception and caching

## Implementation Details

### Files to Create
- `service/src/scrapers/facebook-scraper.ts` - Main scraper class
- `service/src/scrapers/browser-pool.ts` - Browser instance management
- `service/src/utils/session-manager.ts` - Cookie/session handling
- `service/src/types/scraper.ts` - Scraper types and interfaces
- `service/src/config/stealth-config.ts` - Stealth configuration
- `service/.env.example` - Add Playwright and Facebook config vars

### Files to Modify
- `service/package.json` - Add Playwright dependencies
- `service/src/index.ts` - Initialize scraper on startup

### Code Snippets
```typescript
// service/src/types/scraper.ts
export interface FacebookSession {
  userId: string;
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires?: number;
  }>;
  userAgent: string;
  createdAt: Date;
  lastUsed: Date;
}

export interface ScrapedPost {
  id: string;
  url: string;
  content: string;
  author: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  images: string[];
  scrapedAt: Date;
}

export interface ScraperConfig {
  headless: boolean;
  stealth: boolean;
  maxConcurrent: number;
  requestDelay: number;
  userAgent: string;
}
```

```typescript
// service/src/scrapers/browser-pool.ts
import { chromium } from 'playwright';
import { addExtra } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

const playwright = addExtra(chromium);
playwright.use(stealth());

export class BrowserPool {
  private browsers: Map<string, any> = new Map();
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async getBrowser(sessionId: string) {
    if (this.browsers.size >= this.maxConcurrent) {
      throw new Error('Browser pool at capacity');
    }

    if (!this.browsers.has(sessionId)) {
      const browser = await playwright.launch({
        headless: false, // Use headful for Facebook
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox'
        ]
      });
      this.browsers.set(sessionId, browser);
    }

    return this.browsers.get(sessionId);
  }

  async closeBrowser(sessionId: string) {
    const browser = this.browsers.get(sessionId);
    if (browser) {
      await browser.close();
      this.browsers.delete(sessionId);
    }
  }
}
```

## Acceptance Criteria

### Must Have
- [ ] Playwright installed with browser binaries
- [ ] Stealth plugin configured and working
- [ ] Session cookie storage implemented
- [ ] Browser pool manages concurrent instances
- [ ] Rate limiting prevents detection
- [ ] Error handling for blocked requests

### Should Have
- [ ] User-agent rotation
- [ ] Request caching
- [ ] Screenshot capture on errors
- [ ] Detailed logging for debugging

## Testing Requirements

### Unit Tests
- [ ] Test browser pool creation
- [ ] Test session cookie encryption
- [ ] Test stealth configuration

### Integration Tests
- [ ] Test Facebook login with session
- [ ] Test page navigation
- [ ] Test rate limiting behavior

### Manual Testing
- [ ] Verify Facebook doesn't detect automation
- [ ] Test with multiple concurrent sessions
- [ ] Verify cookies persist across restarts

## Definition of Done
- [ ] Code implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

## Notes
- Facebook has aggressive bot detection - stealth is critical
- Use headful mode initially for debugging
- Session cookies expire - implement refresh logic
- Consider using residential proxies for production

## References
- Task 001: `/tasks/001-project-setup.md`
- Playwright docs: https://playwright.dev
- Stealth plugin: https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth
