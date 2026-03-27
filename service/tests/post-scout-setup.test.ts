import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { BrowserPool } from '../src/scrapers/browser-pool';
import { SessionManager, sessionStorage } from '../src/utils/session-manager';
import { getRandomUserAgent, getRandomViewport, getRandomDelay } from '../src/config/stealth-config';

describe('Post Scout Setup - Browser Pool & Session Manager', () => {
  let browserPool: BrowserPool;
  let sessionManager: SessionManager;

  beforeAll(() => {
    browserPool = new BrowserPool(2); // Limit to 2 for testing
    sessionManager = new SessionManager();
  });

  afterAll(async () => {
    await browserPool.closeAll();
    await sessionStorage.clear();
  });

  describe('Stealth Config', () => {
    it('should generate random user agent', () => {
      const ua1 = getRandomUserAgent();
      const ua2 = getRandomUserAgent();
      
      expect(ua1).toBeDefined();
      expect(ua1).toContain('Mozilla/5.0');
      expect(ua2).toBeDefined();
    });

    it('should generate random viewport', () => {
      const viewport = getRandomViewport();
      
      expect(viewport).toBeDefined();
      expect(viewport.width).toBeGreaterThan(0);
      expect(viewport.height).toBeGreaterThan(0);
    });

    it('should generate random delay within range', () => {
      const delay = getRandomDelay();
      
      expect(delay).toBeGreaterThanOrEqual(2000);
      expect(delay).toBeLessThanOrEqual(5000);
    });
  });

  describe('Browser Pool', () => {
    it('should create browser pool with max concurrent limit', () => {
      const pool = new BrowserPool(3);
      const stats = pool.getStats();
      
      expect(stats.maxConcurrent).toBe(3);
      expect(stats.available).toBe(3);
    });

    it('should get session statistics', () => {
      const stats = browserPool.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.maxConcurrent).toBeDefined();
      expect(stats.active).toBeGreaterThanOrEqual(0);
    });

    it('should handle capacity limit', async () => {
      const smallPool = new BrowserPool(1);
      
      // Create first session
      const session1 = await smallPool.getSession('test-session-1');
      expect(session1).toBeDefined();
      
      // Try to create second session (should fail)
      await expect(smallPool.getSession('test-session-2')).rejects.toThrow('Browser pool at capacity');
      
      // Clean up
      await smallPool.closeSession('test-session-1');
    });

    it('should close session successfully', async () => {
      const session = await browserPool.getSession('test-close-session');
      expect(session).toBeDefined();
      
      await browserPool.closeSession('test-close-session');
      
      const stats = browserPool.getStats();
      expect(stats.active).toBeGreaterThanOrEqual(0);
    });

    it('should close all sessions', async () => {
      await browserPool.closeAll();
      
      const stats = browserPool.getStats();
      expect(stats.active).toBe(0);
    });
  });

  describe('Session Manager', () => {
    const testUserId = 'test-user-123';
    const testCookies = [
      {
        name: 'c_user',
        value: 'test123',
        domain: '.facebook.com',
        path: '/',
        expires: Date.now() + 86400000,
      },
      {
        name: 'xs',
        value: 'testxs123',
        domain: '.facebook.com',
        path: '/',
        expires: Date.now() + 86400000,
      },
    ];

    it('should create a new session', async () => {
      const session = await sessionManager.createSession(
        testUserId,
        testCookies
      );

      expect(session).toBeDefined();
      expect(session.userId).toBe(testUserId);
      expect(session.cookies).toHaveLength(2);
      expect(session.isActive).toBe(true);
      expect(session.userAgent).toBeDefined();
    });

    it('should get session by user ID', async () => {
      const session = await sessionManager.getSession(testUserId);
      
      expect(session).toBeDefined();
      expect(session?.userId).toBe(testUserId);
    });

    it('should validate Facebook cookies', () => {
      const validCookies = [
        { name: 'c_user', value: '123' },
        { name: 'xs', value: 'abc' },
      ];
      
      const invalidCookies = [
        { name: 'c_user', value: '123' },
        // Missing 'xs'
      ];

      expect(sessionManager.validateCookies(validCookies as any)).toBe(true);
      expect(sessionManager.validateCookies(invalidCookies as any)).toBe(false);
    });

    it('should touch session (update lastUsed)', async () => {
      const beforeTouch = await sessionManager.getSession(testUserId);
      await sessionManager.touchSession(testUserId);
      const afterTouch = await sessionManager.getSession(testUserId);
      
      expect(afterTouch?.lastUsed.getTime()).toBeGreaterThanOrEqual(
        beforeTouch?.lastUsed.getTime() || 0
      );
    });

    it('should deactivate session', async () => {
      await sessionManager.deactivateSession(testUserId);
      const session = await sessionManager.getSession(testUserId);
      
      expect(session?.isActive).toBe(false);
    });

    it('should get active sessions', async () => {
      // Create another session
      await sessionManager.createSession(
        'test-user-456',
        testCookies
      );
      
      const activeSessions = await sessionManager.getActiveSessions();
      
      // Only the new session should be active (test-user-123 was deactivated)
      expect(activeSessions.length).toBeGreaterThanOrEqual(1);
      expect(activeSessions.every(s => s.isActive)).toBe(true);
    });

    it('should export session to JSON', async () => {
      const session = await sessionManager.getSession(testUserId);
      expect(session).toBeDefined();
      
      const json = sessionManager.exportSession(session!);
      expect(json).toBeDefined();
      expect(typeof json).toBe('string');
      
      // Should be valid JSON
      const parsed = JSON.parse(json);
      expect(parsed.userId).toBe(testUserId);
    });

    it('should import session from JSON', async () => {
      const session = await sessionManager.getSession(testUserId);
      const json = sessionManager.exportSession(session!);
      
      const imported = await sessionManager.importSession(json);
      
      expect(imported).toBeDefined();
      expect(imported.userId).toBe(testUserId);
    });

    it('should delete session', async () => {
      const deleted = await sessionManager.deleteSession(testUserId);
      expect(deleted).toBe(true);
      
      const session = await sessionManager.getSession(testUserId);
      expect(session).toBeNull();
    });

    it('should handle invalid session JSON', async () => {
      const invalidJson = '{"invalid": "data"}';
      
      await expect(sessionManager.importSession(invalidJson)).rejects.toThrow('Invalid session JSON');
    });
  });

  describe('Integration', () => {
    it('should work together: browser pool + session manager', async () => {
      const userId = 'integration-test-user';
      const cookies = [
        {
          name: 'c_user',
          value: 'test123',
          domain: '.facebook.com',
          path: '/',
        },
        {
          name: 'xs',
          value: 'testxs',
          domain: '.facebook.com',
          path: '/',
        },
      ];

      // Create session
      const session = await sessionManager.createSession(userId, cookies);
      expect(session).toBeDefined();

      // Get browser session
      const browserSession = await browserPool.getSession(userId);
      expect(browserSession).toBeDefined();

      // Verify session and browser are linked
      expect(browserSession.id).toBe(userId);

      // Clean up
      await sessionManager.deleteSession(userId);
      await browserPool.closeSession(userId);
    });
  });
});
